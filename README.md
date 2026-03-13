<div align="center">

<img src="images/Gemini_Generated_Image_dwy78jdwy78jdwy7-removebg-preview.png" alt="anotEX.ai logo" width="180" />

# anotEX.ai

**Transforme qualquer aula em resumo, flashcards e mapa mental — automaticamente.**

Grave, faça upload ou cole um link do YouTube. A IA transcreve, resume e gera materiais de estudo completos em segundos.

<br/>

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Redis](https://img.shields.io/badge/Upstash_Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=&logoColor=white)

</div>

---

## Sumário

- [Visão Geral](#visão-geral)
- [Features](#features)
- [Arquitetura](#arquitetura)
- [Stack Completa](#stack-completa)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados — Supabase](#banco-de-dados--supabase)
- [Deploy](#deploy)
- [Endpoints da API](#endpoints-da-api)

---

## Visão Geral

O **anotEX.ai** é uma plataforma de estudo com IA que automatiza o processo de anotação. Você grava uma aula, faz upload de um arquivo de áudio ou cola um link do YouTube — o sistema transcreve com Groq Whisper, gera um resumo inteligente com título, cria flashcards para revisão espaçada e estrutura um mapa mental navegável, tudo de forma assíncrona.

O backend foi construído com **NestJS e Clean Architecture** estrita. O frontend segue **Feature-Sliced Design (FSD)**. Todo processamento de áudio passa por uma fila **BullMQ + Upstash Redis** para garantir resiliência e escalabilidade.

---

## Features

### Gravação e Upload
- Gravação de áudio direto pelo browser via **MediaRecorder API** (`audio/webm;codecs=opus`)
- Upload de arquivos de áudio de qualquer origem
- Armazenamento seguro no **Cloudflare R2** com URLs assinadas (15 minutos de expiração)

### Processamento com IA
- **Transcrição automática** via Groq Whisper Large v3 — alta precisão, baixa latência
- **Resumo inteligente** com título gerado automaticamente via Groq Llama 3.3 70B
- **Flashcards** gerados automaticamente para revisão espaçada
- **Mapa mental** estruturado em Markdown navegável via markmap
- **Quiz** gerado automaticamente (backend completo, UI em desenvolvimento)

### Pastas de Estudo
A feature central da plataforma. Organize qualquer material por tema, independente de qual aula o gerou.

- Crie pastas temáticas e adicione resumos, transcrições, mapas mentais e flashcards de qualquer gravação
- Visualize todos os materiais de um tema em um único lugar, agrupados por tipo
- **Recomendações de vídeo desbloqueadas a partir de 5 itens**: o sistema analisa o conteúdo da pasta com Groq Llama e usa a **YouTube Data API v3** para recomendar 5 vídeos relacionados ao tema
- **Processe qualquer vídeo recomendado direto na plataforma**: o backend baixa o áudio via **yt-dlp-wrap**, joga no mesmo pipeline de transcrição e gera novos materiais — sem sair do app
- Player do YouTube embedado na tela, sem redirecionamento externo

### Interface
- Design dark-first com sistema de cores consistente
- Busca em tempo real nas transcrições
- Polling automático de status (TanStack Query, 5s quando PENDING/PROCESSING)
- Toasts de feedback via Sonner
- Layout responsivo com sidebar e navbar com suporte mobile

### Autenticação e Segurança
- Auth via **Supabase** com email + senha
- JWT validado em todas as rotas protegidas
- **Row Level Security (RLS)** habilitado em todas as tabelas — cada usuário acessa apenas seus próprios dados
- Rate limiting global (100 req/min) e específico para uploads
- Headers de segurança via Helmet

---

## Arquitetura

### Backend — Clean Architecture

```
backend/src/
├── modules/
│   ├── audio/                  # Upload, storage, status
│   ├── transcription/          # Transcrição + resumo + fila
│   ├── study-materials/        # Flashcards, mindmap, quiz
│   └── study-folders/          # Pastas temáticas + recomendações YouTube
├── shared/
│   ├── domain/                 # Result<T, E> pattern
│   ├── infrastructure/         # Config, env validation (Joi)
│   └── presentation/           # Filtros, interceptors, decorators globais
└── main.ts                     # API ou Worker (WORKER_ONLY=true)
```

Cada módulo segue a separação em camadas:

```
módulo/
├── domain/
│   ├── entities/       # Entidades e tipos de domínio puro
│   ├── repositories/   # Interfaces (contratos abstratos)
│   └── use-cases/      # Regras de negócio — sem dependência de infra
├── application/
│   ├── dto/            # Data Transfer Objects com class-validator
│   └── services/       # Queue processors (BullMQ workers)
├── infrastructure/
│   ├── repositories/   # Implementações concretas (Supabase)
│   └── providers/      # Implementações de IA (Groq, YouTube)
└── presentation/
    └── controllers/    # Recebem requisição, delegam ao use-case
```

**Regra de ouro:** dependências sempre apontam para dentro. `domain/` nunca importa de `infrastructure/` ou de bibliotecas externas.

### Frontend — Feature-Sliced Design (FSD)

```
frontend/src/
├── app/        # Providers globais, router, estilos globais
├── pages/      # Composição de widgets/features por rota (10 páginas)
├── widgets/    # Blocos de UI independentes (Navbar, Sidebar, etc.)
├── features/   # Ações do usuário (login, gravar, upload, pastas)
├── entities/   # Modelos de negócio com UI e queries
└── shared/     # UI base, axios, supabase client, hooks, tipos
```

**Regra de importação:** `app → pages → widgets → features → entities → shared`. Camadas superiores importam das inferiores, nunca o contrário.

### Fluxo de Processamento Assíncrono

```
1. POST /api/v1/audio/upload
        │
        ├─► Salva áudio no Cloudflare R2
        ├─► Cria registro em audios (status: PENDING)
        ├─► Cria registro em transcriptions (status: PENDING)
        └─► Enfileira job no BullMQ (Upstash Redis)

2. Worker de transcrição (serviço separado no Railway)
        │
        ├─► Groq Whisper Large v3    → texto transcrito
        ├─► Groq Llama 3.3 70B       → resumo + título
        └─► Salva COMPLETED no Supabase

3. Worker de materiais (mesmo processo do worker de transcrição)
        │
        ├─► Groq Llama 3.3 70B       → flashcards (array JSON)
        ├─► Groq Llama 3.3 70B       → mapa mental (Markdown)
        ├─► Groq Llama 3.3 70B       → quiz (array JSON)
        └─► Salva em study_materials no Supabase

4. Frontend
        └─► TanStack Query polling a cada 5s → exibe resultado ao completar
```

---

## Stack Completa

### Backend

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 22+ | Runtime |
| NestJS | 11 | Framework HTTP + injeção de dependência |
| TypeScript | 5.7 | Linguagem (strict mode, sem `any`) |
| Groq SDK | 0.37 | Transcrição (Whisper) + LLM (Llama) |
| @supabase/supabase-js | 2.98 | Banco de dados + Auth |
| @aws-sdk/client-s3 | 3 | Cloudflare R2 (compatível com S3) |
| BullMQ | 5 | Fila de jobs assíncrona |
| yt-dlp-wrap | — | Download de áudio do YouTube |
| ffmpeg-static | 5 | Conversão de formatos de áudio |
| Helmet | 8 | Headers de segurança HTTP |
| @nestjs/throttler | 6 | Rate limiting |
| class-validator | 0.15 | Validação de DTOs |
| Joi | 18 | Validação de variáveis de ambiente no startup |
| Jest | 30 | Testes unitários (32 testes, 8 suites) |

### Frontend

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | UI |
| Vite | 7 | Build tool |
| TypeScript | 5.9 | Linguagem (strict mode) |
| Tailwind CSS | 4 | Estilização via CSS custom properties |
| Framer Motion | 12 | Animações |
| TanStack Query | 5 | Cache, polling e sincronização de dados |
| React Router | 7 | Roteamento SPA |
| Zustand | 5 | Estado global |
| Axios | 1 | HTTP client com interceptor JWT automático |
| @supabase/supabase-js | 2 | Auth (email + senha) |
| Lucide React | 0.577 | Ícones (sem emojis na UI) |
| markmap-lib + markmap-view | 0.18 | Renderização interativa de mapa mental |
| react-markdown | 10 | Renderização de Markdown |
| Sonner | 2 | Toasts de feedback |

### Infraestrutura

| Serviço | Uso |
|---|---|
| **Supabase** | Banco de dados (Postgres), autenticação, RLS por tabela |
| **Cloudflare R2** | Storage de áudio — S3-compatible, zero egress fee |
| **Upstash Redis** | Broker da fila BullMQ — serverless, TLS, porta 6379 |
| **Railway** | Deploy do backend — API e Worker como serviços separados |
| **Cloudflare Workers** | Deploy do frontend — edge, modo SPA |
| **Groq** | APIs de IA: Whisper Large v3 (transcrição) + Llama 3.3 70B (LLM) |
| **YouTube Data API v3** | Busca de vídeos recomendados para Pastas de Estudo |

---

## Estrutura do Projeto

```
anotEX.ai/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── audio/
│   │   │   │   ├── domain/         # entities, repositories, use-cases
│   │   │   │   ├── application/    # dto
│   │   │   │   ├── infrastructure/ # Supabase + R2 implementations
│   │   │   │   └── presentation/   # controller, guards
│   │   │   ├── transcription/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/    # queue processor (BullMQ)
│   │   │   │   ├── infrastructure/ # Groq Whisper + Groq Llama providers
│   │   │   │   └── presentation/
│   │   │   ├── study-materials/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/    # queue processor (BullMQ)
│   │   │   │   ├── infrastructure/ # Groq Llama provider
│   │   │   │   └── presentation/
│   │   │   └── study-folders/
│   │   │       ├── domain/         # entities, repositories, 7 use-cases
│   │   │       ├── application/    # dto
│   │   │       ├── infrastructure/ # Supabase + YouTube providers
│   │   │       └── presentation/
│   │   ├── shared/
│   │   │   ├── domain/             # Result<T, E> pattern
│   │   │   ├── infrastructure/     # Config, Supabase, env validation
│   │   │   └── presentation/       # HttpExceptionFilter, LoggingInterceptor
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # Router, providers, globals.css
│   │   ├── pages/                  # 10 páginas (Landing, Login, Dashboard, etc.)
│   │   ├── widgets/                # Navbar, Sidebar, MouseLight, FlashcardDeck, MindMapViewer
│   │   ├── features/               # auth, recording, transcription, study-folders
│   │   ├── entities/               # audio, transcription, study-material, study-folder
│   │   └── shared/
│   │       ├── api/                # axios.ts (interceptor JWT) + endpoints.ts
│   │       ├── auth/               # supabase.ts client
│   │       ├── hooks/              # useAudioLevel, useMousePosition
│   │       ├── ui/                 # Button, Card, Input, Badge, Skeleton, etc.
│   │       └── assets/             # logos e imagens
│   ├── package.json
│   ├── vite.config.ts
│   └── wrangler.jsonc              # config do Cloudflare Workers
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 20260307000000_enable_rls.sql
│       ├── 20260307000001_study_materials.sql
│       ├── 20260313000000_study_folders.sql
│       └── 20260313000001_study_folder_items_audio_id.sql
│
├── docs/
│   └── features/
│       └── study-folders.md
├── DEPLOY.md
└── README.md
```

---

## Como Rodar Localmente

### Pré-requisitos

- Node.js 22+
- npm 10+
- Conta no [Supabase](https://supabase.com)
- Conta no [Groq](https://console.groq.com)
- Bucket no [Cloudflare R2](https://dash.cloudflare.com)
- Banco no [Upstash Redis](https://console.upstash.com)
- Chave da [YouTube Data API v3](https://console.cloud.google.com) (Google Cloud Console → habilitar YouTube Data API v3)

---

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/anotEx.ai.git
cd anotEx.ai
```

---

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute as migrations na ordem:

```sql
-- Execute cada arquivo individualmente no SQL Editor do Supabase:
-- 1. supabase/migrations/001_initial_schema.sql
-- 2. supabase/migrations/20260307000000_enable_rls.sql
-- 3. supabase/migrations/20260307000001_study_materials.sql
-- 4. supabase/migrations/20260313000000_study_folders.sql
-- 5. supabase/migrations/20260313000001_study_folder_items_audio_id.sql
```

3. Vá em **Authentication → Providers → Email** e confirme que está habilitado
4. Em **Authentication → URL Configuration**, adicione como Redirect URL:
   - `http://localhost:5173/auth/callback`

---

### 3. Configure o Cloudflare R2

1. No Cloudflare Dashboard → **R2 → Create bucket** → nome: `audios-anotex`
2. Em **Settings → CORS**, adicione a origem do seu backend
3. Gere as credenciais de API em **Manage R2 API Tokens**
4. Anote: `Account ID`, `Access Key ID`, `Secret Access Key`

---

### 4. Configure o Upstash Redis

1. Acesse [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Escolha região próxima ao Railway
3. Anote: `UPSTASH_REDIS_URL` (formato `rediss://...`) e `UPSTASH_REDIS_TOKEN`

---

### 5. Rode o backend

```bash
cd backend
npm install
cp .env.example .env
# Preencha o .env com suas credenciais
```

Em dois terminais separados:

```bash
# Terminal 1 — API
npm run start:dev

# Terminal 2 — Worker (processa os jobs da fila)
WORKER_ONLY=true npm run start:dev
```

Verifique:
```bash
curl http://localhost:3000/api/v1/health
# Esperado: { "status": "ok" }
```

**Testes:**
```bash
npm run test          # todos os testes unitários
npm run test:watch    # modo watch
npm run test:cov      # relatório de cobertura
```

---

### 6. Rode o frontend

```bash
cd frontend
npm install
```

Crie o `.env`:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

```bash
npm run dev
# http://localhost:5173
```

---

## Variáveis de Ambiente

### Backend — `.env`

```env
# App
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Nunca expor ao frontend

# Groq
GROQ_API_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=audios-anotex
R2_PUBLIC_URL=https://pub-xxxx.r2.dev

# Upstash Redis
UPSTASH_REDIS_URL=rediss://xxxx.upstash.io:6379
UPSTASH_REDIS_TOKEN=

# YouTube Data API v3
YOUTUBE_API_KEY=

# Limites
MAX_AUDIO_SIZE_MB=500
SIGNED_URL_EXPIRES_IN_SECONDS=900
```

> Todas as variáveis são validadas com Joi no startup. A aplicação não sobe se alguma obrigatória estiver ausente.

### Frontend — `.env`

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## Banco de Dados — Supabase

### Tabelas

| Tabela | Descrição |
|---|---|
| `audios` | Registro de cada arquivo de áudio — status, path no R2, user_id |
| `transcriptions` | Texto transcrito, resumo, título e status do processamento |
| `study_materials` | Flashcards, mapa mental (Markdown) e quiz por transcrição |
| `study_folders` | Pastas temáticas do usuário — nome, descrição, contagem de itens |
| `study_folder_items` | Itens salvos em cada pasta — referências por transcription_id e audio_id |

### Row Level Security (RLS)

**Todas as tabelas têm RLS habilitado.** Cada usuário acessa somente seus próprios dados via `auth.uid()` — a verificação acontece no banco, não apenas no código.

```sql
-- Exemplo: usuário vê apenas seus próprios áudios
CREATE POLICY "audios_select_own"
  ON audios FOR SELECT
  USING (auth.uid() = user_id);
```

O backend usa `SUPABASE_SERVICE_ROLE_KEY`, que bypassa o RLS de forma controlada para escrita nos workers. O frontend usa apenas a `SUPABASE_ANON_KEY` — nunca acessa o banco diretamente.

Todas as colunas `user_id` usadas nas policies têm índices dedicados para evitar full table scans.

---

## Deploy

### Backend — Railway

O backend roda como **dois serviços separados** no Railway a partir do mesmo repositório. O mesmo binário decide o que fazer pela variável `WORKER_ONLY`.

#### Serviço `api`

1. [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo** → selecione o repositório
2. **Settings:**
   - Root Directory: `backend`
   - Start Command: `node dist/main.js`
3. **Variables:** adicione todas as env vars do backend

#### Serviço `worker`

1. No mesmo projeto → **+ Create → GitHub Repo** → mesmo repositório
2. **Settings:**
   - Root Directory: `backend`
   - Start Command: `node dist/main.js`
3. **Variables:** mesmas env vars do `api` + `WORKER_ONLY=true`

> O Worker não sobe servidor HTTP — apenas inicializa o contexto NestJS e processa jobs da fila BullMQ continuamente.

#### Após criar os serviços

1. **Settings → Domains → Generate Domain** no serviço `api` → anote a URL
2. Atualize `ALLOWED_ORIGINS` com a URL do frontend em produção (sem barra no final)
3. Verifique: `https://sua-url.up.railway.app/api/v1/health`

---

### Frontend — Cloudflare Workers

#### Deploy manual

```bash
cd frontend
npm run build
npx wrangler deploy --assets ./dist
```

> **Importante:** sempre use `--assets ./dist`. Sem a flag, o Wrangler lê o projeto inteiro ao invés do build compilado.

#### Deploy via Cloudflare Pages (CI/CD automático)

1. [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project → Connect to Git**
2. Selecione o repositório
3. **Build settings:**
   - Build command: `cd frontend && npm run build`
   - Build output directory: `frontend/dist`
   - Root directory: `/` (deixe vazio)
4. **Environment Variables:**
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   VITE_API_BASE_URL=https://sua-api.up.railway.app/api/v1
   ```

#### `wrangler.jsonc`

```jsonc
{
  "name": "anoteexai",
  "compatibility_date": "2025-09-27",
  "assets": {
    "not_found_handling": "single-page-application"
  }
}
```

---

### Configurações pós-deploy

1. **Railway → serviço `api` → Variables:**
   - Atualize `ALLOWED_ORIGINS` com a URL do Cloudflare (sem barra no final)
   - Múltiplas origens: separe por vírgula — `https://site1.com,https://site2.com`

2. **Supabase → Authentication → URL Configuration:**
   - **Site URL:** URL do Cloudflare
   - **Redirect URLs:** `https://seu-site.workers.dev/auth/callback`

---

### Checklist de deploy

- [ ] `GET /api/v1/health` retorna 200 no Railway
- [ ] Logs do serviço `worker` no Railway mostram jobs sendo processados
- [ ] Login com email + senha funcionando no frontend
- [ ] Upload de áudio e transcrição ponta a ponta funcionando
- [ ] Flashcards e mapa mental gerados após transcrição
- [ ] Pastas de Estudo criando e listando corretamente
- [ ] Recomendações de YouTube aparecem após 5 itens na pasta

---

## Endpoints da API

Todas as rotas (exceto `/health`) exigem `Authorization: Bearer <token>` no header.

```
GET    /api/v1/health

# Áudio
POST   /api/v1/audio/upload                          # multipart/form-data
GET    /api/v1/audio/status/:jobId

# Transcrições
GET    /api/v1/transcription                         # lista do usuário
GET    /api/v1/transcription/:id

# Materiais de estudo
GET    /api/v1/study-materials/:transcriptionId      # flashcards + mindmap + quiz

# Pastas de estudo
GET    /api/v1/study-folders                         # lista todas as pastas
POST   /api/v1/study-folders                         # cria nova pasta
GET    /api/v1/study-folders/:id                     # pasta + itens agrupados por tipo
PATCH  /api/v1/study-folders/:id                     # renomeia ou atualiza descrição
DELETE /api/v1/study-folders/:id
POST   /api/v1/study-folders/:id/items               # adiciona material à pasta
DELETE /api/v1/study-folders/:id/items/:itemId       # remove material da pasta
GET    /api/v1/study-folders/:id/recommendations     # vídeos YouTube (requer 5+ itens)
POST   /api/v1/study-folders/:id/process-video       # processa vídeo YouTube na plataforma
```

---

<div align="center">

Feito com foco em estudar melhor — e em construir software bem feito.

</div>
