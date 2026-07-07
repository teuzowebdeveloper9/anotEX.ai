# Deploy — anotEX.ai (Azure)

Toda a infraestrutura roda no Azure, no resource group `rg-anotex-prod` (região `brazilsouth`).
Os nomes dos recursos estão versionados em `infra/azure-resources.env`.

## 1. Recursos

| Recurso | Nome | Observações |
|---|---|---|
| Resource Group | `rg-anotex-prod` | `brazilsouth` |
| Container Registry (ACR) | `acranotexf9cf7` | Imagem única do backend (api + worker) |
| PostgreSQL Flexible Server 16 | `pg-anotex-f9cf7` | Database `anotex`; schema em `infra/azure-postgres-schema.sql` |
| Azure Managed Redis | `redis-anotex-f9cf7` | TLS, porta 10000 (fila Bull) |
| Storage Account | `stanotexf9cf7` | Container privado `audios`, SAS URLs de 15 min |
| Container Apps Environment | `cae-anotex` | Domínio `calmhill-a7701bda.brazilsouth.azurecontainerapps.io` |
| Container App (API) | `anotex-api` | Ingress externo, porta 3000, probe `/api/v1/health` |
| Container App (Worker) | `anotex-worker` | `WORKER_ONLY=true`, sem ingress, KEDA scaler de Redis |
| Static Web Apps | `swa-anotex` | Frontend — `https://gray-pond-038b6cb0f.7.azurestaticapps.net` |
| Communication Services | `acs-anotex-f9cf7` + `email-anotex` | Envio dos magic links por email |

**URLs:**
- API: `https://anotex-api.calmhill-a7701bda.brazilsouth.azurecontainerapps.io/api/v1`
- Frontend: `https://gray-pond-038b6cb0f.7.azurestaticapps.net`

---

## 2. Redeploy do Backend (api + worker)

A imagem é única (Dockerfile em `backend/`: `node:22-slim` + `ffmpeg` + `yt-dlp`) e serve os dois apps.

```bash
# 1. Build da imagem
cd backend
docker build -t acranotexf9cf7.azurecr.io/anotex-backend:vNN .

# 2. Login no ACR e push
az acr login --name acranotexf9cf7
docker push acranotexf9cf7.azurecr.io/anotex-backend:vNN

# 3. Atualizar os dois Container Apps para a nova imagem
az containerapp update -g rg-anotex-prod -n anotex-api \
  --image acranotexf9cf7.azurecr.io/anotex-backend:vNN

az containerapp update -g rg-anotex-prod -n anotex-worker \
  --image acranotexf9cf7.azurecr.io/anotex-backend:vNN
```

> Use uma tag nova (`vNN`) a cada deploy — não reutilize `latest`, senão o Container Apps pode não puxar a imagem nova.

### Verificar

```bash
curl https://anotex-api.calmhill-a7701bda.brazilsouth.azurecontainerapps.io/api/v1/health
az containerapp logs show -g rg-anotex-prod -n anotex-api --follow
az containerapp logs show -g rg-anotex-prod -n anotex-worker --follow
```

---

## 3. Redeploy do Frontend (Static Web Apps)

```bash
# 1. Build com a URL da API de produção
cd frontend
VITE_API_BASE_URL=https://anotex-api.calmhill-a7701bda.brazilsouth.azurecontainerapps.io/api/v1 \
  npm run build

# 2. Pegar o deployment token do SWA
az staticwebapp secrets list -g rg-anotex-prod -n swa-anotex \
  --query properties.apiKey -o tsv

# 3. Deploy do dist/
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token <TOKEN_DO_PASSO_2> \
  --env production
```

`VITE_API_BASE_URL` é a **única** env var do frontend e é embutida no build — sempre exporte-a antes do `npm run build`.

---

## 4. Env vars e secrets

Todas as env vars/secrets do backend ficam **nos Container Apps** (`anotex-api` e `anotex-worker`) — não há Key Vault nem `.env` em produção. A lista canônica está em `backend/src/shared/infrastructure/config/env.validation.ts` (validada com Joi no startup).

```bash
# Ver env vars atuais
az containerapp show -g rg-anotex-prod -n anotex-api \
  --query properties.template.containers[0].env -o table

# Atualizar/adicionar uma env var (repetir para anotex-worker quando aplicável)
az containerapp update -g rg-anotex-prod -n anotex-api \
  --set-env-vars CHAVE=valor

# Secrets (valores sensíveis) + referência via secretref
az containerapp secret set -g rg-anotex-prod -n anotex-api \
  --secrets minha-chave=VALOR
az containerapp update -g rg-anotex-prod -n anotex-api \
  --set-env-vars MINHA_CHAVE=secretref:minha-chave
```

Diferença entre os apps: `anotex-worker` tem `WORKER_ONLY=true` e não expõe HTTP; o restante das env vars é idêntico.

---

## 5. Pendências pós-migração

- [ ] **`YOUTUBE_API_KEY`** está com valor placeholder — colar o valor real nos dois apps:
  ```bash
  az containerapp update -g rg-anotex-prod -n anotex-api --set-env-vars YOUTUBE_API_KEY=<valor>
  az containerapp update -g rg-anotex-prod -n anotex-worker --set-env-vars YOUTUBE_API_KEY=<valor>
  ```
- [ ] **`ABACATEPAY_*`** ainda não configuradas nos Container Apps (API key, webhook secret, HMAC key, product IDs, return/completion URLs)
- [ ] **Migração de dados do Supabase** — pendente de credenciais; seguir o guia `infra/data-migration-supabase.md`
- [ ] **Webhook do AbacatePay** — atualizar no painel do AbacatePay para apontar para a URL nova da API (`https://anotex-api.calmhill-a7701bda.brazilsouth.azurecontainerapps.io/api/v1/...`)

---

## Checklist final

- [ ] API respondendo em `/api/v1/health`
- [ ] Worker processando jobs (logs do `anotex-worker` + escala KEDA quando há itens na fila)
- [ ] Login com magic link (email via ACS) e login email/senha funcionando
- [ ] Upload de áudio, transcrição e resumo ponta a ponta
- [ ] SAS URLs de áudio funcionando (Blob privado)
