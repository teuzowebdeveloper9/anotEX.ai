# Plano de Migração — Infra atual → Microsoft Azure

## STATUS (2026-07-07): EXECUTADO

A migração foi concluída em versão **ampliada** em relação ao plano abaixo:

- **Fases 1–3 concluídas:** backend (api + worker) em Azure Container Apps (`anotex-api`/`anotex-worker`, imagem única no ACR `acranotexf9cf7`, Dockerfile `node:22-slim` + ffmpeg + yt-dlp), fila Bull sobre Azure Managed Redis (`redis-anotex-f9cf7`, TLS porta 10000, KEDA scaler no worker), storage em Azure Blob (`stanotexf9cf7`/`audios`, SAS 15 min) e frontend em Azure Static Web Apps (`swa-anotex`).
- **Fase 4 (Supabase) também executada**, mas com **auth própria** em vez de Entra External ID: banco em Azure Database for PostgreSQL Flexible Server 16 (`pg-anotex-f9cf7`, db `anotex`, acesso via `pg` parametrizado, sem RLS — autorização por `user_id` na aplicação) e `modules/auth` com magic link via Azure Communication Services + email/senha (bcrypt), JWT HS256 1h + refresh rotacionado 30d.
- **Fase 5 (IA) também executada**, mas com **OpenAI API** (whisper-1 + gpt-4o-mini) em vez de Azure OpenAI/Foundry — as interfaces de provider continuam permitindo fallbacks futuros.
- **Pendente:** migração dos dados do Supabase (aguardando credenciais) — guia em `infra/data-migration-supabase.md`.

O restante deste documento é o plano original, mantido como registro histórico.

---

> Gerado em 2026-07-07. Pré-requisito de tooling: plugin `azure@azure-skills` instalado no Claude Code
> (skills `azure-prepare`, `azure-validate`, `azure-deploy`, `azure-cloud-migrate`, `azure-cost`, etc. + Azure MCP Server).

---

## 1. Infra atual (estado real do código)

| Componente | Hoje | Evidência no repo |
|---|---|---|
| Frontend | Vite + React 19 estático no **Cloudflare Pages** (há também `wrangler.jsonc` p/ Workers assets) | `frontend/`, `DEPLOY.md`, `wrangler.jsonc` |
| API HTTP | NestJS no **Railway** (nixpacks: `nodejs_22` + `ffmpeg`), porta 3000, prefixo `api/v1` | `backend/nixpacks.toml`, `backend/src/main.ts` |
| Worker | **Mesmo build**, segundo service Railway com `WORKER_ONLY=true` (só application context, sem HTTP) | `main.ts:76` |
| Fila | **BullMQ/Bull** sobre **Upstash Redis** (TLS, porta 6379 hardcoded). Filas: `TRANSCRIPTION_QUEUE` e `study-material` | `app.module.ts:34-47` |
| Banco + Auth | **Supabase** (Postgres + Auth Magic Link + RLS; 17 migrations em `supabase/migrations/`). Backend usa `SERVICE_ROLE_KEY` (bypassa RLS); frontend usa SDK só para sessão | `shared/infrastructure/config/` |
| Storage de áudio | **Cloudflare R2** via `@aws-sdk/client-s3` (bucket privado, signed URLs de 15 min) | `audio/infrastructure/repositories/storage.repository.impl.ts` |
| IA | **Groq** (Whisper Large v3 transcrição; Llama 3.3 70B resumo/materiais/chat) com padrão de fallback por interface | `*/infrastructure/providers/groq-*.impl.ts` |
| Pagamentos | **AbacatePay** (API + webhook HMAC) | `modules/payments/` |
| Extras | `yt-dlp` (download YouTube, com mitigação de proxy/cookies), `ffmpeg` (fluent-ffmpeg), `YOUTUBE_API_KEY` obrigatória | `env.validation.ts`, `process-video.use-case.ts` |

## 2. Mapeamento serviço → Azure

| Hoje | Azure (recomendado) | Alternativa | Mudança de código? |
|---|---|---|---|
| Railway (api) | **Azure Container Apps** — app `api`, ingress externo :3000, probe em `/api/v1/health` | App Service (Web App for Containers) | Não (só Dockerfile) |
| Railway (worker) | **Azure Container Apps** — app `worker`, mesma imagem, `WORKER_ONLY=true`, sem ingress, **KEDA scaler de Redis** (tamanho das filas `TRANSCRIPTION_QUEUE`/`study-material`) | Idem | Não |
| Nixpacks | **Dockerfile** (node:22-slim + `ffmpeg` + binário `yt-dlp`) + **Azure Container Registry** | — | Novo `backend/Dockerfile` |
| Upstash Redis | **Azure Managed Redis / Azure Cache for Redis** (Standard C0+ p/ SLA), TLS **porta 6380** | Manter Upstash (funciona de qualquer cloud) | Sim, pequena: generalizar config Redis (hoje `app.module.ts` assume Upstash e hardcoda porta 6379) |
| Cloudflare Pages | **Azure Static Web Apps** (free tier, CDN, previews de PR, domínio custom) | Blob Static Website + Front Door | Não (só env vars `VITE_*`) |
| Cloudflare R2 | **Azure Blob Storage** (container privado + **SAS URLs** com expiração de 15 min, user delegation key) | Manter R2 (S3 API não existe no Blob!) | Sim: nova `AzureBlobStorageRepositoryImpl` implementando `IStorageRepository` (3 métodos: upload, getSignedUrl, delete) — Clean Architecture torna isso plugável |
| Supabase (DB+Auth) | **Fase opcional/final**: Azure Database for PostgreSQL Flexible Server + Microsoft Entra External ID | **Manter Supabase (recomendado)** — é SaaS neutro, e trocar Auth (Magic Link) + RLS é a mudança mais invasiva do sistema | Enorme se migrar; zero se manter |
| Groq | **Opcional**: Azure AI Foundry (Whisper no Azure OpenAI; Llama 3.3 70B serverless) como novo provider de fallback | Manter Groq como primário | Só se quiser: novas impls de `ITranscriptionProvider`/`ISummaryProvider` |
| Secrets no dashboard | **Azure Key Vault** + Managed Identity + secret refs no Container Apps | — | Não |
| Logs Railway | **Application Insights + Log Analytics** (skill `appinsights-instrumentation`) | — | Pequena (SDK opcional) |
| Deploy manual | **azd (Azure Developer CLI) + Bicep + GitHub Actions** — gerados pelas skills `azure-prepare`/`azure-deploy` | — | Arquivos novos (`infra/`, `azure.yaml`, workflow) |

## 3. Decisões-chave

1. **Migração em fases, não big-bang.** Supabase, Groq e AbacatePay são SaaS acessíveis de qualquer cloud — nada obriga migrá-los junto com o compute.
2. **Manter Supabase (DB + Auth) na v1 da migração.** RLS usa `auth.uid()` (construção do Supabase) e o frontend depende do Magic Link do SDK. Trocar por Entra External ID + Postgres Flexible é um projeto à parte (Fase 4, opcional).
3. **Blob Storage substitui R2 na Fase 2** — o código usa SDK S3, que **não** fala com Blob; é preciso nova implementação do repositório (interface já isola isso).
4. **BullMQ continua** — só troca o Redis por trás. Não migrar para Service Bus/Storage Queues (reescrita desnecessária).

## 4. Fases

### Fase 0 — Preparação (½ dia)
- [ ] `az login` + `azd auth login`; conferir subscription e quotas (skill `azure-quotas`)
- [ ] Resource group único (ex.: `rg-anotex-prod`, região `brazilsouth` ou `eastus2` p/ custo)
- [ ] Rodar a skill **`azure-prepare`** no repo para gerar `azure.yaml` + Bicep base

### Fase 1 — Compute + fila (1–2 dias) → paridade com Railway
- [ ] `backend/Dockerfile`: `node:22-slim`, `apt-get install ffmpeg`, copiar binário `yt-dlp`, `npm ci && npm run build`, `CMD node dist/main.js`
- [ ] Azure Container Registry + build da imagem
- [ ] Provisionar Redis (Managed Redis/Cache for Redis). **Atenção:** TLS na porta **6380**
- [ ] Refatorar config do Bull em `app.module.ts`: aceitar `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`/`REDIS_TLS` genéricos (hoje assume Upstash e porta 6379); adicionar `maxRetriesPerRequest: null` e keepalive (o idle-timeout de ~10 min do Azure Redis derruba conexões bloqueantes do BullMQ)
- [ ] Container App `api`: ingress externo, env vars atuais, probe `/api/v1/health`, min 1 réplica
- [ ] Container App `worker`: `WORKER_ONLY=true`, sem ingress, min 0/max N com KEDA scaler `redis` nas listas `bull:transcription:wait` e `bull:study-material:wait`
- [ ] Key Vault + managed identity para os secrets
- [ ] Frontend: Azure Static Web Apps apontando para o repo (`frontend/`, output `dist`), `VITE_API_BASE_URL` → domínio do Container App
- [ ] Pós-corte: atualizar `ALLOWED_ORIGINS`, Redirect URLs no Supabase Auth, webhook do AbacatePay
- [ ] Validar com a skill **`azure-validate`**; smoke test ponta a ponta (upload → transcrição → materiais)

### Fase 2 — Storage R2 → Blob (1 dia + janela de cópia)
- [ ] `AzureBlobStorageRepositoryImpl` (`@azure/storage-blob`): `upload`, `getSignedUrl` via **SAS de user delegation** (15 min), `delete` — trocar binding no `AudioModule`
- [ ] Copiar objetos existentes: `rclone` R2 → Blob (ou AzCopy); janela de dual-read se necessário
- [ ] Testes unitários da nova impl (mock do SDK), manter cobertura exigida
- [ ] Desativar R2 após verificação de integridade (contagem + amostragem)

### Fase 3 — Observabilidade, CI/CD e hardening (1 dia)
- [ ] Application Insights (skill `appinsights-instrumentation`) + alertas (falha de job, 5xx, fila crescendo)
- [ ] GitHub Actions: build/test → `azd deploy` (skill `azure-deploy` gera o workflow) — substitui deploy automático do Railway/Pages
- [ ] Domínio custom + certificado no Static Web Apps e Container Apps
- [ ] Revisar custos com a skill **`azure-cost`**

### Fase 4 — (OPCIONAL, projeto separado) Supabase → Azure nativo
- Postgres Flexible Server (migrar as 17 migrations; reescrever policies RLS que usam `auth.uid()`)
- Entra External ID com email OTP substituindo Magic Link (muda `SupabaseAuthGuard`, frontend inteiro de auth)
- Só faz sentido por exigência de compliance/enterprise — não por custo.

### Fase 5 — (OPCIONAL) IA no Azure
- Azure OpenAI Whisper + Llama 3.3 70B serverless no AI Foundry como providers de fallback (ou primários), aproveitando o padrão `ITranscriptionProvider`/`ISummaryProvider` já existente.

## 5. Riscos e pontos de atenção

| Risco | Mitigação |
|---|---|
| BullMQ × Azure Redis: idle timeout mata conexões blocking (`BRPOPLPUSH`) | `maxRetriesPerRequest: null`, `keepAlive`, retry strategy; testar job de 30+ min |
| Upload de áudio até 500 MB pelo Container Apps ingress (Envoy) | Timeout de request configurável; médio prazo: upload direto ao Blob com SAS de escrita (tira o buffer do backend) |
| yt-dlp bloqueado por IP de datacenter Azure (YouTube) | Já existe mitigação `YTDLP_PROXY_URL`/`YTDLP_COOKIES_PATH` — manter proxy residencial |
| ffmpeg ausente na imagem | Dockerfile instala via apt (equivalente ao nixPkgs atual) |
| CORS/redirects quebrados no corte | Checklist explícito na Fase 1 (ALLOWED_ORIGINS, Supabase Auth URLs, AbacatePay) |
| Custo maior que Railway free | Ver §6; worker com scale-to-zero compensa |

## 6. Custo estimado (mensal, região US)

| Recurso | Tier | Estimativa |
|---|---|---|
| Container Apps `api` (1 réplica 0.5 vCPU/1 GiB) | Consumption | ~US$ 10–15 |
| Container Apps `worker` | Consumption, scale-to-zero | ~US$ 0–10 |
| Azure Cache for Redis | Standard C0 (SLA) / Basic B0 (dev) | ~US$ 40 / ~US$ 16 |
| Blob Storage (10 GB + ops) | Hot LRS | < US$ 1 |
| Static Web Apps | Free | US$ 0 |
| Container Registry | Basic | ~US$ 5 |
| App Insights | Pay-as-you-go (baixo volume) | ~US$ 0–5 |
| **Total Fases 1–3** | | **~US$ 30–75/mês** |

> Hoje: ~US$ 0–5/mês (free tiers). O Redis é o maior salto — alternativa legítima é **manter Upstash** na Fase 1 e decidir depois. Créditos Azure for Students/Startups cobrem o início.

## 7. Ordem de execução resumida

```
Fase 0 (prep) → Fase 1 (compute+fila+frontend) → corte de DNS → Fase 2 (storage) → Fase 3 (observabilidade/CI) → [Fase 4/5 opcionais]
```
