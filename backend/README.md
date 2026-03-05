# anotEX.ai — Backend

Backend do anotEX.ai. NestJS + Clean Architecture + Groq + Supabase + Cloudflare R2.

---

## Checklist de Setup (faça nessa ordem)

### 1. Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project** e preencha nome e senha do banco
3. Aguarde o projeto inicializar (~2 min)
4. Vá em **Settings > API** e copie:
   - `Project URL` → será o `SUPABASE_URL`
   - `anon public` → será o `SUPABASE_ANON_KEY`
   - `service_role secret` → será o `SUPABASE_SERVICE_ROLE_KEY` ⚠️ nunca exponha isso no frontend
5. Vá em **SQL Editor**, cole o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql` e clique em **Run**
   - Isso cria as tabelas `audios` e `transcriptions` com RLS habilitado

---

### 2. Groq

1. Acesse [console.groq.com](https://console.groq.com) e crie uma conta (gratuito)
2. Vá em **API Keys > Create API Key**
3. Copie a chave → será o `GROQ_API_KEY`

---

### 3. Cloudflare R2

1. Acesse [cloudflare.com](https://cloudflare.com) e crie uma conta (gratuito)
2. No painel, vá em **R2 Object Storage > Create Bucket**
3. Dê um nome ao bucket (ex: `anotex-audios`) → será o `R2_BUCKET_NAME`
4. Vá em **Manage R2 API Tokens > Create API Token**
   - Permissão: `Object Read & Write`
   - Copie:
     - `Access Key ID` → `R2_ACCESS_KEY_ID`
     - `Secret Access Key` → `R2_SECRET_ACCESS_KEY`
5. Vá em **R2 > Overview** e copie o **Account ID** → `R2_ACCOUNT_ID`
6. Em **Bucket Settings**, configure o bucket como **privado** (sem acesso público)
7. Copie a URL do bucket (formato `https://<account_id>.r2.cloudflarestorage.com`) → `R2_PUBLIC_URL`

---

### 4. Upstash Redis

1. Acesse [upstash.com](https://upstash.com) e crie uma conta (gratuito)
2. Clique em **Create Database > Redis**
3. Selecione a região mais próxima e clique em **Create**
4. Na tela do banco, copie:
   - `UPSTASH_REDIS_URL` (formato `redis://...`)
   - `UPSTASH_REDIS_TOKEN`

---

### 5. Configurar variáveis de ambiente localmente

Na pasta `backend/`, crie o arquivo `.env` copiando o `.env.example`:

```bash
cp .env.example .env
```

Preencha com todos os valores coletados nos passos anteriores:

```env
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

GROQ_API_KEY=gsk_...

R2_ACCOUNT_ID=abc123
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=anotex-audios
R2_PUBLIC_URL=https://abc123.r2.cloudflarestorage.com

UPSTASH_REDIS_URL=redis://...
UPSTASH_REDIS_TOKEN=...

MAX_AUDIO_SIZE_MB=100
SIGNED_URL_EXPIRES_IN_SECONDS=900
```

---

### 6. Rodar localmente

```bash
cd backend
npm install
npm run start:dev
```

A API estará disponível em `http://localhost:3000/api/v1`.

Para testar se está funcionando:

```bash
curl http://localhost:3000/api/v1/audio
# Deve retornar 401 Unauthorized (correto, precisa de token)
```

---

### 7. Deploy no Railway

1. Acesse [railway.app](https://railway.app) e crie uma conta (gratuito — $5 de crédito/mês)
2. Clique em **New Project > Deploy from GitHub Repo**
3. Selecione o repositório `anotEX.ai` e a pasta `backend/` como root
4. Vá em **Variables** e adicione todas as variáveis do `.env`, com:
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS` apontando para o domínio do frontend (ex: `https://anotex.pages.dev`)
5. O Railway fará o build automaticamente
6. Após o deploy, copie a URL gerada (ex: `https://anotex-backend.up.railway.app`) — será usada no frontend

---

## Endpoints disponíveis

Todos exigem header `Authorization: Bearer <supabase_jwt_token>`.

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/v1/audio/upload` | Upload de arquivo de áudio (multipart/form-data, campo `audio`) |
| `GET` | `/api/v1/audio` | Lista todos os áudios do usuário autenticado |
| `GET` | `/api/v1/audio/:id/status` | Consulta status do áudio e transcrição (polling) |
| `DELETE` | `/api/v1/audio/:id` | Remove um áudio do usuário |

### Exemplo de upload

```bash
curl -X POST http://localhost:3000/api/v1/audio/upload \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -F "audio=@/caminho/para/aula.webm" \
  -F "language=pt"
```

### Resposta do upload

```json
{
  "audioId": "uuid",
  "transcriptionId": "uuid",
  "status": "PENDING",
  "fileName": "aula.webm",
  "createdAt": "2026-03-05T..."
}
```

### Polling de status

```bash
curl http://localhost:3000/api/v1/audio/{audioId}/status \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

```json
{
  "audio": { "id": "uuid", "status": "COMPLETED", "fileName": "aula.webm" },
  "transcription": {
    "id": "uuid",
    "status": "COMPLETED",
    "transcriptionText": "Hoje vamos falar sobre...",
    "summaryText": "## Resumo\n1. Tópico A...",
    "errorMessage": null
  }
}
```

Status possíveis: `PENDING` → `PROCESSING` → `COMPLETED` / `FAILED`

---

## Estrutura do projeto

```
backend/
  src/
    modules/
      audio/
        domain/          # Entidades, interfaces de repositório, use-cases
        application/     # DTOs
        infrastructure/  # Implementações: Supabase, Cloudflare R2
        presentation/    # Controller, Guard de autenticação
      transcription/
        domain/          # Entidades, interfaces, use-cases
        application/     # DTOs, processador da fila BullMQ
        infrastructure/  # Groq Whisper, Groq Llama 3 70B, Supabase
    shared/
      domain/            # Result<T,E> pattern
      infrastructure/    # Config Supabase, validação de env
      presentation/      # Filtro global, interceptor de log, decorator @Public
  supabase/
    migrations/          # SQL para rodar no Supabase SQL Editor
```
