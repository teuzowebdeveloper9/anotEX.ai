# Deploy — anotEX.ai

## 1. Railway (Backend)

### Criar conta e projeto
1. Acesse railway.com → **Login com GitHub**
2. **New Project** → **Deploy from GitHub repo** → seleciona o repo `anotEx.ai`
3. Railway vai detectar o backend automaticamente

### Configurar o service `api`
1. Clica no service criado → aba **Settings**
2. **Root Directory:** `backend`
3. **Start Command:** `node dist/main.js`
4. Aba **Variables** → adiciona todas as env vars abaixo

### Criar o service `worker` (mesmo repo)
1. No projeto → **+ Create** → **GitHub Repo** → mesmo repo
2. **Root Directory:** `backend`
3. **Start Command:** `node dist/main.js`
4. Aba **Variables** → mesmas env vars + `WORKER_ONLY=true`

### Env vars (Railway) — cole nos 2 services
```
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://SEU_SITE.pages.dev

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

> No service `worker` adiciona também: `WORKER_ONLY=true`

### Pegar a URL da API
Settings → **Domains** → Generate Domain → anota a URL (ex: `https://backend-production-xxxx.up.railway.app`)

---

## 2. Cloudflare Pages (Frontend)

1. Acesse pages.cloudflare.com → **Create a project** → **Connect to Git**
2. Seleciona o repo `anotEx.ai`
3. Configura o build:
   - **Build command:** `cd frontend && npm run build`
   - **Build output directory:** `frontend/dist`
   - **Root directory:** `/` (deixa vazio)
4. **Environment Variables:**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=https://SUA_URL.up.railway.app/api/v1
```
5. **Save and Deploy**

---

## 3. Após o deploy

- Volta no Railway → service `api` → **Variables** → atualiza `ALLOWED_ORIGINS` com a URL do Cloudflare Pages
- No Supabase → **Authentication** → **URL Configuration** → adiciona a URL do Pages como **Site URL** e em **Redirect URLs**

---

## Checklist final
- [ ] API do Railway respondendo em `/api/v1/health`
- [ ] Worker processando jobs (ver logs do service worker)
- [ ] Login com Magic Link funcionando
- [ ] Upload de áudio e transcrição ponta a ponta
