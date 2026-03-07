# Deploy & Infraestrutura — anotEX.ai

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        USUÁRIO                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Pages (Frontend)                    │
│         Vite + React  ·  CDN Global  ·  Free               │
└──────────────────────────┬──────────────────────────────────┘
                           │ API calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                Railway (Backend)                            │
│   ┌──────────────────┐   ┌──────────────────────────────┐  │
│   │  NestJS API      │   │  BullMQ Worker               │  │
│   │  (web service)   │   │  (background worker)         │  │
│   └──────────────────┘   └──────────────────────────────┘  │
└───────┬────────────────────────────┬────────────────────────┘
        │                            │
        ▼                            ▼
┌───────────────┐          ┌─────────────────────┐
│   Supabase    │          │   Upstash Redis      │
│  Postgres +   │          │  (fila BullMQ)       │
│  Auth + RLS   │          │  Free tier           │
└───────────────┘          └─────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│           Cloudflare R2               │
│  (storage de áudios — privado)        │
│  Free: 10GB/mês storage, 1M ops/mês  │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│               Groq API                │
│  Whisper Large v3 (transcrição)       │
│  Llama 3.3 70B (resumo + materiais)   │
│  Free tier com rate limits            │
└───────────────────────────────────────┘
```

---

## Serviços e Custo

| Serviço | O que faz | Plano | Custo |
|---|---|---|---|
| **Railway** | Backend NestJS + Worker | Hobby ($5/mês crédito grátis) | ~$0–5/mês |
| **Cloudflare Pages** | Hosting do frontend | Free | $0 |
| **Cloudflare R2** | Storage de áudios | Free (10GB/1M ops) | $0 |
| **Supabase** | Postgres + Auth + RLS | Free (500MB DB, 50MB storage) | $0 |
| **Upstash Redis** | Fila BullMQ | Free (10k req/dia) | $0 |
| **Groq** | IA (Whisper + Llama) | Free (rate limited) | $0 |
| **Total** | | | **$0–5/mês** |

---

## Frontend — Cloudflare Pages

### Por que Cloudflare Pages e não Vercel?
- CDN global automático (melhor latência no Brasil)
- Builds ilimitados no free tier
- Integração com R2 e Workers no mesmo ecossistema
- Sem cold starts (é estático)

### Setup
1. Conectar repositório no Cloudflare Pages dashboard
2. Configurar build:
   ```
   Build command:   cd frontend && npm run build
   Output dir:      frontend/dist
   Root dir:        /
   ```
3. Variáveis de ambiente (Settings → Environment Variables):
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   VITE_API_BASE_URL=https://seu-backend.railway.app/api/v1
   ```

### Deploy automático
Cloudflare Pages faz deploy automático a cada push na branch `main`.
Previews automáticos para PRs.

---

## Backend — Railway

### Estrutura de services no Railway
O backend precisa de **dois services** rodando o mesmo código com comandos diferentes:

```
railway-project/
├── api          (web service — recebe HTTP requests)
└── worker       (background — processa fila BullMQ)
```

### Por que dois services?
O NestJS sobe tanto o servidor HTTP quanto o consumer da fila no mesmo processo. Em produção, é melhor separar para:
- Escalar os workers independentemente
- Não afetar a API se o processamento de IA travar
- Restart do worker não derruba a API

### Configuração no Railway

**Service 1: API**
```
Start command: node dist/main.js
```

**Service 2: Worker** (mesmo código, variável diferente)
```
Start command: WORKER_ONLY=true node dist/main.js
```

Para suportar `WORKER_ONLY`, atualizar `main.ts`:
```typescript
if (process.env.WORKER_ONLY === 'true') {
  // Sobe só os módulos de fila, sem HTTP server
  const app = await NestFactory.createApplicationContext(AppModule)
  await app.init()
} else {
  // Sobe o servidor HTTP normal
  const app = await NestFactory.create(AppModule)
  // ...
}
```

### Variáveis de ambiente no Railway
```
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://anotex.pages.dev,https://anotex.ai

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GROQ_API_KEY=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=audios-anotex
R2_PUBLIC_URL=

UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

MAX_AUDIO_SIZE_MB=500
SIGNED_URL_EXPIRES_IN_SECONDS=900
```

### Nixpacks (build automático no Railway)
Railway detecta NestJS automaticamente. O `package.json` já tem:
```json
"build": "nest build",
"start:prod": "node dist/main.js"
```
O Railway roda `npm run build` e depois `npm run start:prod`.

**Atenção:** o ffmpeg precisa estar disponível no container do Railway.
Adicionar ao `package.json`:
```json
"scripts": {
  "railway:build": "apt-get install -y ffmpeg && npm run build"
}
```
Ou usar um `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["ffmpeg"]
```

---

## CI/CD — GitHub Actions (opcional)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: cd backend && npm ci && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/railway-github-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}

  # Frontend é automático via Cloudflare Pages
```

---

## Domínio Customizado

1. **Cloudflare Pages**: Settings → Custom Domains → `anotex.ai`
2. **Railway API**: Settings → Domains → `api.anotex.ai`
3. Atualizar `VITE_API_BASE_URL` para `https://api.anotex.ai/api/v1`
4. Atualizar `ALLOWED_ORIGINS` para `https://anotex.ai`

Se o domínio já está no Cloudflare (DNS), a propagação é instantânea.

---

## Checklist de Deploy

### Pré-deploy
- [ ] Rodar migrations no Supabase SQL Editor (RLS + study_materials)
- [ ] Configurar RLS em todas as tabelas
- [ ] Testar build local: `npm run build` em backend e frontend
- [ ] Confirmar variáveis de ambiente completas

### Railway
- [ ] Criar conta e projeto no Railway
- [ ] Conectar repositório GitHub
- [ ] Criar service `api` com `cd backend && npm run build && node dist/main.js`
- [ ] Criar service `worker` com `WORKER_ONLY=true`
- [ ] Adicionar todas as env vars
- [ ] Adicionar `nixpacks.toml` com ffmpeg
- [ ] Verificar logs de startup

### Cloudflare Pages
- [ ] Criar projeto conectado ao repo
- [ ] Configurar build command e output dir
- [ ] Adicionar env vars de produção
- [ ] Verificar primeiro deploy

### Pós-deploy
- [ ] Testar upload de áudio ponta a ponta
- [ ] Verificar que transcription job processa
- [ ] Verificar geração de study materials
- [ ] Testar auth (Magic Link)

---

## Monitoramento

**Railway**: logs em tempo real no dashboard, alertas de crash automáticos.

**Supabase**: Dashboard → Logs → API logs para ver queries lentas.

**Upstash**: Dashboard mostra jobs na fila, failed jobs.

Para o futuro (quando escalar):
- Sentry para error tracking
- Railway metrics para CPU/memória
- Alertas de rate limit do Groq (429)

---

## nixpacks.toml (criar na raiz do backend)

```toml
[phases.setup]
nixPkgs = ["ffmpeg", "nodejs_22"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node dist/main.js"
```

---

## Estimativa de Escala — Free Tier

Com o free tier atual:
- **Usuários simultâneos**: ~50 (Railway Hobby aguenta bem)
- **Uploads/dia**: limitado pelo Groq (20 req/min transcrição, ~1k req/dia)
- **Storage**: 10GB no R2 (~100 aulas de 1h em WebM)
- **DB**: 500MB Supabase (~50k transcrições)

Quando precisar escalar:
1. Groq pago → sem rate limit
2. Railway Pro → mais CPU/RAM para o worker
3. Supabase Pro → mais DB e storage
