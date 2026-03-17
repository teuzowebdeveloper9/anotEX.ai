# anotEX.ai — AGENTS Guide

## Purpose

This file is the operational contract for agents working in this repository.
Use it as the default source of truth for how to inspect, modify, test, and explain changes in `anotEX.ai`.

`CLAUDE.md` remains useful as historical and conceptual guidance, but this file should be the practical baseline for execution.

---

## Current Project State

- Monorepo-like structure with separate `backend/` and `frontend/`
- Backend: NestJS 11 + strict TypeScript + Clean Architecture
- Frontend: React 19 + Vite 7 + strict TypeScript + Feature-Sliced Design
- Infra: Supabase, Cloudflare R2, Upstash Redis, Railway, Cloudflare Workers
- AI pipeline: Groq Whisper + Groq Llama, async processing with BullMQ

### Recent active area

The most recent commits are concentrated in `study-folders`, especially YouTube recommendation processing and `yt-dlp` execution/download behavior.

Recent commits:

- `b9a1311` `fix(study-folders): download yt-dlp_linux using Node https module (no curl/python)`
- `60a4d47` `fix(study-folders): download yt-dlp_linux standalone binary via curl (no Python)`
- `5d5c636` `fix(study-folders): use yt-dlp standalone binary (no Python dependency)`
- `0bef496` `fix(study-folders): auto-download yt-dlp binary if not found in PATH`
- `d8350d2` `feat(study-folders): add process-video endpoint to generate study materials from YouTube recommendations`

Treat `backend/src/modules/study-folders/domain/use-cases/process-video.use-case.ts` as a sensitive file. Read it carefully before changing related behavior.

---

## Repository Map

### Backend

Main modules:

- `audio`
- `transcription`
- `study-materials`
- `study-folders`

Expected backend structure:

```text
backend/src/modules/<module>/
  domain/
    entities/
    repositories/
    use-cases/
  application/
    dto/
    services/
  infrastructure/
    repositories/
    providers/
  presentation/
    controllers/
    guards/
```

### Frontend

The frontend follows FSD:

```text
app -> pages -> widgets -> features -> entities -> shared
```

Current feature areas include:

- auth
- recording
- transcription
- study-folders

---

## Non-Negotiable Architecture Rules

### Backend

- Dependencies point inward only
- `domain/` must not import NestJS, infrastructure, or presentation code
- Use cases depend on interfaces, not implementations
- Controllers delegate only; business logic belongs in use cases/services
- Repositories and providers implement contracts defined in the domain

### Frontend

- Respect FSD import direction strictly
- Route composition belongs in `pages`
- Reusable business-facing behavior belongs in `features` or `entities`, not `pages`
- Shared primitives live in `shared`
- Backend access goes through `frontend/src/shared/api/axios.ts`

---

## Coding Standards

- TypeScript strict mode is assumed everywhere
- Do not introduce `any`
- Public function return types should be explicit
- Prefer small, composable units over large multipurpose services
- File naming uses kebab-case
- Keep naming aligned with existing suffix patterns:
  - `.use-case.ts`
  - `.controller.ts`
  - `.service.ts`
  - `.repository.ts`
  - `.repository.impl.ts`
  - `.provider.ts`
  - `.provider.impl.ts`
  - `.dto.ts`
  - `.entity.ts`
  - `.guard.ts`

---

## Security and Data Rules

- Never expose `SUPABASE_SERVICE_ROLE_KEY` outside the backend
- Assume all public tables need RLS and related indexes
- Never trust JWT metadata for authorization when database enforcement is required
- Never log tokens, API keys, raw audio, or sensitive user content
- Avoid `CORS=*` in production logic
- Validation must stay explicit at API boundaries

---

## Testing Rules

- New backend business logic should come with unit tests
- Prioritize tests for use cases, guards, providers, and global filters
- Follow the existing Jest setup in `backend/package.json`
- Do not claim verification if tests were not run

Useful commands:

```bash
cd backend && npm run test
cd backend && npm run test:cov
cd frontend && npm run build
cd frontend && npm run lint
```

---

## Working Method For Agents

Before changing code:

1. Read the local module boundaries involved
2. Check for uncommitted changes with `git status --short`
3. Inspect recent commits if the feature area is active
4. Reuse existing patterns before introducing new ones

When implementing:

1. Make the smallest coherent change that solves the problem
2. Preserve repository conventions already in use
3. Avoid broad refactors unless explicitly requested
4. Keep infrastructure details out of domain code

Before finishing:

1. Run the narrowest useful verification
2. Summarize what changed, what was verified, and what remains unverified

---

## Preferred User Workflows

Agents working in this repo should respond well to requests like:

- "analise primeiro e depois implemente"
- "faça um plano curto antes de alterar"
- "revise esse diff com foco em bugs e regressões"
- "siga o AGENTS.md e atualize-o se o padrão do projeto mudar"
- "antes de codar, leia os arquivos X, Y, Z"
- "se mexer em backend, valide arquitetura e testes"

When the user wants recurring behavior, prefer encoding it into:

1. `AGENTS.md` for persistent repository rules
2. `ai-docs/*.md` for workflow playbooks
3. project scripts for repeatable automation

That combination is the closest equivalent to project-specific "skills".

---

## Change Policy

Update this file whenever one of these changes:

- architecture rules
- stack or providers
- testing policy
- deployment/runtime constraints
- recurring team preferences
- standard workflow for agent collaboration

If `CLAUDE.md` and `AGENTS.md` diverge, preserve the codebase reality first and then reconcile the docs explicitly.
