<div align="center">

<img src="images/Gemini_Generated_Image_dwy78jdwy78jdwy7-removebg-preview.png" alt="anotEX.ai logo" width="180" />

# anotEX.ai

**Transforme qualquer aula em resumo, flashcards, mapa mental e quiz — automaticamente.**

Grave, faça upload ou cole um link do YouTube. A IA transcreve, resume e gera materiais de estudo completos em segundos.

<br/>

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
<br/>
![Azure](https://img.shields.io/badge/Microsoft_Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![Container Apps](https://img.shields.io/badge/Azure_Container_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Azure_Managed_Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

[![Publicar imagem Docker](https://github.com/teuzowebdeveloper9/anotEX.ai/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/teuzowebdeveloper9/anotEX.ai/actions/workflows/docker-publish.yml)
[![Docker Image](https://img.shields.io/docker/v/teuzowebdeveloper9/anotex-backend?label=docker%20hub&logo=docker&sort=semver)](https://hub.docker.com/r/teuzowebdeveloper9/anotex-backend)
[![Image Size](https://img.shields.io/docker/image-size/teuzowebdeveloper9/anotex-backend/latest?logo=docker)](https://hub.docker.com/r/teuzowebdeveloper9/anotex-backend)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgrey)

</div>

---

## Sumário

- [Visão Geral](#visão-geral)
- [Features](#features)
- [Arquitetura](#arquitetura)
- [Stack Completa](#stack-completa)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Docker](#docker)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Segurança](#segurança)
- [Deploy — Azure](#deploy--azure)

---

## Visão Geral

O **anotEX.ai** é uma plataforma de estudo com IA que automatiza o processo de anotação. Você grava uma aula, faz upload de um arquivo de áudio ou cola um link do YouTube — o sistema **transcreve com OpenAI Whisper** (com timestamps), gera um **resumo inteligente** com título, cria **flashcards** para revisão espaçada, estrutura um **mapa mental** navegável, gera um **quiz** de múltipla escolha, permite **conversar com o conteúdo** da aula via chat, e agenda **revisões automáticas** com o algoritmo SM-2 (Anki) — tudo de forma assíncrona.

O backend usa **NestJS com Clean Architecture** estrita (12 módulos). O frontend segue **Feature-Sliced Design (FSD)**. Todo processamento de áudio passa por uma fila **Bull + Azure Managed Redis** para resiliência e escala. A infraestrutura é **100% Microsoft Azure**.

---

## Features

### Gravação e Upload
- Gravação de áudio direto pelo browser via **MediaRecorder API** (`audio/webm;codecs=opus`)
- Upload de arquivos de áudio de qualquer origem (validação por magic bytes, não pelo MIME do cliente)
- Import de vídeos do **YouTube** via `yt-dlp`
- Armazenamento privado no **Azure Blob Storage** com **SAS URLs** (15 min de expiração)

### Processamento com IA (OpenAI)
- **Transcrição com timestamps** via **Whisper (`whisper-1`)** — segmentos com `start/end` por trecho
- **Resumo inteligente** + título gerados via **`gpt-4o-mini`**
- **Flashcards** com frente, verso, dificuldade e tópico
- **Mapa mental** em Markdown navegável (markmap)
- **Quiz** de múltipla escolha com 4 opções, resposta correta e explicação

### Player com Timestamps Clicáveis
- Cada trecho da transcrição é clicável e posiciona o player no momento exato

### Chat com a Aula
- Converse com o conteúdo da aula (streaming SSE via `gpt-4o-mini`)

### Revisão Espaçada — Algoritmo SM-2
- Agendamento automático de revisões dos flashcards (mesmo algoritmo do Anki)

### Extras
- **Pastas de estudo**, **compartilhamento** por link público e **grupos de estudo**
- **Pomodoro** integrado
- **Exportar** materiais (PDF, TXT, Anki)
- **Conta e LGPD**: exclusão de conta com cascade e retenção automática de dados
- **Assinatura** via AbacatePay (PIX/cartão), preço resolvido server-side

---

## Arquitetura

### Backend — Clean Architecture (12 módulos)

Separação rígida de camadas; as dependências apontam sempre para dentro.

```
src/modules/<módulo>/
  domain/           # entidades, interfaces (repositories/providers), use-cases
  application/      # DTOs, services de orquestração
  infrastructure/   # implementações concretas (Postgres, OpenAI, Azure Blob)
  presentation/     # controllers, guards
```

Módulos: `auth`, `audio`, `transcription`, `study-materials`, `study-folders`, `sharing`, `study-groups`, `chat`, `spaced-repetition`, `pomodoro`, `payments`, `user`.

- **Dependency Inversion**: use-cases dependem de interfaces (`ITranscriptionProvider`, `IStorageRepository`), nunca de implementações — trocar OpenAI por outro provider é uma classe nova, sem tocar no domínio.
- **Auth própria**: magic link (Azure Communication Services) + email/senha (bcrypt), JWT HS256 (1h) + refresh token opaco rotacionado (30 dias), guard global validando localmente.
- **Acesso a dados**: `pg` com SQL parametrizado (`PostgresService` global) — sem ORM, sem RLS; autorização por `user_id` do JWT na camada de aplicação.

### Frontend — Feature-Sliced Design (FSD)

```
app → pages → widgets → features → entities → shared
```

Camadas superiores importam das inferiores, nunca o contrário. Auth via `shared/auth/auth-client.ts` (tokens em localStorage, refresh single-flight, interceptor Axios com retry em 401).

### Fluxo de Processamento Assíncrono

```
Upload → Azure Blob → job na fila (Bull/Redis) → Worker:
  Whisper (transcrição) → gpt-4o-mini (resumo/título) →
  materiais (flashcards/mapa mental/quiz) → status COMPLETED
```

O **worker** roda a mesma imagem do backend com `WORKER_ONLY=true` (sem HTTP) e escala pela fila via **KEDA**.

---

## Stack Completa

| Camada | Tecnologia |
|---|---|
| **Backend** | Node.js 22 · NestJS · TypeScript estrito |
| **Frontend** | Vite · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · TanStack Query · Zustand |
| **IA** | OpenAI — `whisper-1` (transcrição) · `gpt-4o-mini` (resumo, chat, materiais) |
| **Banco** | Azure Database for PostgreSQL Flexible Server 16 (`pg`, SQL parametrizado) |
| **Auth** | Própria — magic link (Azure Communication Services) + email/senha (bcrypt) + JWT |
| **Storage** | Azure Blob Storage (SAS URLs privadas) |
| **Fila** | Bull + Azure Managed Redis (TLS) |
| **Pagamentos** | AbacatePay (PIX/cartão) |
| **Deploy** | Azure Container Apps (api + worker) · Azure Static Web Apps (frontend) · Azure Container Registry |

---

## Estrutura do Projeto

```
anotEX.ai/
├── backend/                 # NestJS (Clean Architecture)
│   ├── src/modules/         # 12 módulos de domínio
│   ├── src/shared/          # config, filters, interceptors, guards globais
│   ├── Dockerfile           # node:22-slim + ffmpeg + yt-dlp
│   └── .env.example
├── frontend/                # Vite + React (FSD)
│   ├── src/{app,pages,widgets,features,entities,shared}/
│   └── public/staticwebapp.config.json   # SPA fallback + security headers (CSP)
├── infra/
│   ├── azure-postgres-schema.sql          # schema consolidado (PG16)
│   ├── azure-resources.env                # nomes dos recursos (sem segredos)
│   └── data-migration-supabase.md         # guia de migração de dados
└── ai-docs/                 # documentação técnica e planos
```

---

## Docker

A imagem do backend (api + worker na mesma imagem) é publicada automaticamente a cada push na `main` e a cada tag `vN` via **GitHub Actions** (`.github/workflows/docker-publish.yml`), em dois registries:

- **GitHub Container Registry** (aparece em *Packages* no repo): `ghcr.io/teuzowebdeveloper9/anotex-backend`
- **Docker Hub**: `teuzowebdeveloper9/anotex-backend`

```bash
# GitHub Container Registry
docker pull ghcr.io/teuzowebdeveloper9/anotex-backend:latest

# ou Docker Hub
docker pull teuzowebdeveloper9/anotex-backend:latest
```

### Rodar a API

```bash
docker run -p 3000:3000 --env-file backend/.env teuzowebdeveloper9/anotex-backend:latest
```

### Rodar o Worker (mesma imagem, sem HTTP)

```bash
docker run --env-file backend/.env -e WORKER_ONLY=true teuzowebdeveloper9/anotex-backend:latest
```

> A imagem inclui **ffmpeg** (compressão de áudio) e **yt-dlp** (import do YouTube). Nenhum segredo é embutido — toda configuração vem por variáveis de ambiente em runtime.

### Build local

```bash
docker build -t anotex-backend ./backend
```

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 22+
- ffmpeg (ou use a imagem Docker)
- Uma instância PostgreSQL 16 e um Redis (ou os recursos Azure)
- Chave da OpenAI

### 1. Clone e instale

```bash
git clone https://github.com/teuzowebdeveloper9/anotEX.ai.git
cd anotEX.ai/backend && npm install
cd ../frontend && npm install
```

### 2. Configure o banco

Aplique o schema consolidado em um Postgres vazio:

```bash
psql "$DATABASE_URL" -1 -f infra/azure-postgres-schema.sql
```

### 3. Backend

```bash
cd backend
cp .env.example .env        # preencha os valores
npm run start:dev           # http://localhost:3000/api/v1
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:3000/api/v1
npm run dev                 # http://localhost:5173
```

### Testes

```bash
cd backend
npm test          # unitários (Jest)
npm run test:cov  # cobertura
```

---

## Variáveis de Ambiente

### Backend — `.env`

```bash
# App
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173

# Banco
DATABASE_URL=postgresql://user:pass@host:5432/anotex?sslmode=require

# Auth
JWT_SECRET=                        # mínimo 32 caracteres
JWT_EXPIRES_IN=1h
MAGIC_LINK_EXPIRES_IN_MINUTES=15
FRONTEND_URL=http://localhost:5173

# Azure Communication Services (magic links)
ACS_CONNECTION_STRING=
ACS_SENDER_ADDRESS=

# OpenAI
OPENAI_API_KEY=

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=
AZURE_STORAGE_KEY=
AZURE_STORAGE_CONTAINER=audios

# Redis (Azure Managed Redis — TLS, porta 10000)
REDIS_HOST=
REDIS_PORT=10000
REDIS_PASSWORD=
REDIS_TLS=true

# AbacatePay (catálogo autoritativo: "productId:precoCentavos:Nome")
ABACATEPAY_API_KEY=
ABACATEPAY_WEBHOOK_SECRET=
ABACATEPAY_PUBLIC_HMAC_KEY=
ABACATEPAY_PRODUCTS=prod_xxx:3990:AnotEx Pro
ABACATEPAY_RETURN_URL=
ABACATEPAY_COMPLETION_URL=

# Limites
MAX_AUDIO_SIZE_MB=100
MAX_UPLOADS_PER_HOUR=30
SIGNED_URL_EXPIRES_IN_SECONDS=900

# YouTube
YOUTUBE_API_KEY=
```

> A lista canônica (com validação Joi) fica em `backend/src/shared/infrastructure/config/env.validation.ts`.

### Frontend — `.env`

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## Banco de Dados

Azure Database for PostgreSQL Flexible Server 16. Schema consolidado em **`infra/azure-postgres-schema.sql`** (18 tabelas).

- Acesso exclusivamente via `pg` com **SQL parametrizado** (`PostgresService`) — sem ORM.
- **Sem RLS**: a autorização é feita na aplicação; toda query multi-tenant filtra por `user_id` vindo do JWT (`req.user.id`).
- Índices em `user_id` obrigatórios; TLS com verificação de certificado.
- Retenção de dados (LGPD) via função `delete_old_user_data()`.

---

## Segurança

Auditada por revisão defensiva (OWASP API Top 10) com verificação adversarial. Medidas em produção:

- **Auth**: JWT HS256 com algoritmo fixado, refresh rotacionado, bcrypt; `/register` não permite reivindicar conta alheia; login sem enumeração (timing-safe).
- **Autorização**: identidade só de `req.user.id`; checagem de ownership em toda leitura/escrita e na criação de links de compartilhamento (anti-IDOR/BOLA).
- **Pagamentos**: preço resolvido server-side (cliente não escolhe valor); webhook com secret timing-safe + HMAC do corpo; match por `billingId`.
- **Input**: `ValidationPipe` global (`whitelist` + `forbidNonWhitelisted`); limite de upload no transporte (anti-DoS); SQL 100% parametrizado.
- **Headers**: `helmet` na API; **CSP** + HSTS + X-Frame-Options + nosniff no frontend (Static Web Apps).
- **Segredos**: só em variáveis de ambiente / secrets do Container Apps; nunca em imagem, código ou logs; `.env` fora do git.
- **Rate limiting**: `@nestjs/throttler` global (100/min por IP) + limites específicos por usuário (uploads) e por rota (login, magic link).

---

## Deploy — Azure

Tudo no resource group `rg-anotex-prod` (região `brazilsouth`).

| Componente | Serviço Azure |
|---|---|
| API + Worker | **Azure Container Apps** (imagem única do ACR; worker com `WORKER_ONLY=true` + KEDA) |
| Frontend | **Azure Static Web Apps** |
| Banco | **Azure Database for PostgreSQL Flexible Server** |
| Fila | **Azure Managed Redis** |
| Storage | **Azure Blob Storage** |
| Registry | **Azure Container Registry** |
| Email | **Azure Communication Services** |

### Redeploy do backend

```bash
docker build -t <acr>.azurecr.io/anotex-backend:vN ./backend
az acr login --name <acr>
docker push <acr>.azurecr.io/anotex-backend:vN
az containerapp update -n anotex-api    -g rg-anotex-prod --image <acr>.azurecr.io/anotex-backend:vN
az containerapp update -n anotex-worker -g rg-anotex-prod --image <acr>.azurecr.io/anotex-backend:vN
```

### Redeploy do frontend

```bash
cd frontend
VITE_API_BASE_URL="https://<api-host>/api/v1" npm run build
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token "$(az staticwebapp secrets list -n <swa> -g rg-anotex-prod --query properties.apiKey -o tsv)" \
  --env production
```

> Passo a passo completo em [`DEPLOY.md`](DEPLOY.md).

---

<div align="center">

Feito com NestJS, React e Azure.

</div>
