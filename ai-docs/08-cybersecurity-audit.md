# Auditoria de Cibersegurança — anotEX.ai

## Normas de Referência

Este documento audita o projeto contra as seguintes normas e frameworks:

| Norma | Escopo |
|-------|--------|
| **OWASP API Security Top 10 (2023)** | APIs REST — as 10 principais vulnerabilidades de API |
| **OWASP Top 10 Web (2021)** | Aplicações web — as 10 principais vulnerabilidades |
| **LGPD** (Lei 13.709/2018) | Proteção de dados pessoais de usuários brasileiros |
| **Secure Coding Practices** (OWASP SCP) | Boas práticas gerais de código seguro |
| **NIST CSF** (Cybersecurity Framework) | Identificar → Proteger → Detectar → Responder → Recuperar |

---

## Legenda de Status

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado e correto |
| ⚠️ | Parcialmente implementado ou com ressalvas |
| ❌ | Não implementado ou com vulnerabilidade ativa |
| 🔵 | Não aplicável ao escopo atual |

---

## 1. OWASP API Security Top 10 (2023)

### API1:2023 — Broken Object Level Authorization (BOLA)

**Status: ✅ Implementado via RLS**

O Supabase com Row Level Security garante que cada usuário só acessa seus próprios dados. Toda tabela tem política de `auth.uid() = user_id`.

```sql
-- Exemplo: audios
CREATE POLICY "users_select_own_audios"
ON audios FOR SELECT USING (auth.uid() = user_id);
```

O backend usa o `service_role_key` que bypassa RLS, mas valida o `userId` do JWT em cada use-case antes de operar.

**Vulnerabilidade residual:** Em nenhum endpoint há verificação de IDOR manual além do RLS — correto para a arquitetura escolhida.

---

### API2:2023 — Broken Authentication

**Status: ✅ Implementado | ⚠️ Ressalva: sem timeout no auth call**

O `SupabaseAuthGuard` é aplicado globalmente como `APP_GUARD`, com rotas públicas marcadas via `@Public()`. O token é validado pelo Supabase (`getUser(token)`), não apenas decodificado localmente.

```typescript
// auth.guard.ts — correto: valida no servidor, não só decodifica
const { data, error } = await this.supabase.auth.getUser(token);
```

**Vulnerabilidade ativa (MÉDIA):** Não há timeout na chamada `getUser()`. Se o Supabase demorar ou ficar indisponível, todas as requisições ficam penduradas indefinidamente.

```typescript
// COMO DEVE SER:
const { data, error } = await Promise.race([
  this.supabase.auth.getUser(token),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 5000)),
]);
```

---

### API3:2023 — Broken Object Property Level Authorization

**Status: ✅ Implementado via ValidationPipe**

```typescript
// main.ts — whitelist remove campos não declarados no DTO
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

Campos extras na requisição são removidos automaticamente antes de chegar nos use-cases.

---

### API4:2023 — Unrestricted Resource Consumption

**Status: ⚠️ Parcialmente implementado**

✅ Rate limit global: 100 req/min por IP via `ThrottlerGuard`
✅ Rate limit de upload: `UserUploadThrottlerGuard` no `AudioController`
✅ Validação de tamanho máximo de arquivo no `UploadAudioUseCase`
✅ Fila BullMQ para processar áudio de forma assíncrona (não bloqueia requests)

**Vulnerabilidade ativa (ALTA):** O `TranscriptionController` e o `StudyMaterialController` **não têm rate limiting específico**. Os endpoints `GET /transcription` e `GET /study-materials/:id` estão protegidos apenas pelo limite global de 100 req/min.

```typescript
// DEVE SER ADICIONADO em TranscriptionController e StudyMaterialController:
@Throttle({ default: { limit: 30, ttl: 60000 } })
@Get()
async listMyTranscriptions(...) {}
```

**Vulnerabilidade ativa (MÉDIA):** O parâmetro de busca `?q=` no `TranscriptionController` não tem validação de tamanho máximo. Uma string de 1 MB como query pode causar problemas.

---

### API5:2023 — Broken Function Level Authorization

**Status: ✅ Implementado**

Não há endpoints admin expostos. O guard global protege tudo por padrão. Não há distinção de roles além de "autenticado/não autenticado", o que é adequado para o produto atual (SaaS single-tenant por usuário).

---

### API6:2023 — Unrestricted Access to Sensitive Business Flows

**Status: ⚠️ Parcialmente implementado**

✅ Upload limitado por `UserUploadThrottlerGuard`
✅ Processamento na fila (não é possível forçar processamento síncrono)

**Gap:** Não há limite de quantos flashcards podem ser gerados por dia, nem limite de chamadas ao endpoint de chat com a aula. Um usuário com conta gratuita no Groq poderia esgotar o rate limit da conta inteira fazendo muitas chamadas ao chat.

---

### API7:2023 — Server Side Request Forgery (SSRF)

**Status: ✅ Não aplicável / Baixo risco**

O backend não faz requests a URLs fornecidas pelo usuário diretamente. A única URL externa é para APIs externas fixas (Groq, Supabase, R2) configuradas via variáveis de ambiente.

O módulo de YouTube (`StudyFolderModule`) recebe uma URL de YouTube do usuário. Deve-se validar que a URL pertence ao domínio `youtube.com` antes de processar.

---

### API8:2023 — Security Misconfiguration

**Status: ⚠️ Riscos identificados**

✅ `helmet()` habilitado — define headers de segurança (X-Content-Type-Options, X-Frame-Options, etc.)
✅ CORS configurado com origins específicas (não `*` em produção)
✅ Variáveis de ambiente validadas no startup via Joi

**Vulnerabilidade ativa (ALTA):** O CORS faz split por vírgula sem `.trim()`. Um erro de digitação no Railway com espaço extra pode causar comportamento inesperado:

```typescript
// BUGADO — espaço após vírgula pode criar origin inválida:
configService.get<string>('ALLOWED_ORIGINS', '').split(',')

// CORRETO:
configService.get<string>('ALLOWED_ORIGINS', '').split(',').map(o => o.trim()).filter(Boolean)
```

**Vulnerabilidade ativa (MÉDIA):** `PORT` está hardcoded em `main.ts` como `3000`. A variável de ambiente `PORT` definida no Joi schema nunca é lida no bootstrap.

---

### API9:2023 — Improper Inventory Management

**Status: ⚠️ Sem versionamento explícito**

Todos os endpoints estão sob `/api/v1/`. Não há documentação automática (Swagger/OpenAPI). Se for necessário uma v2, não há mecanismo de deprecação.

**Recomendação futura:** Adicionar `@nestjs/swagger` para documentação automática.

---

### API10:2023 — Unsafe Consumption of APIs

**Status: ✅ Implementado**

Todas as chamadas ao Groq são feitas pelo backend com API keys server-side. Os erros das APIs externas são capturados e mapeados para erros HTTP adequados antes de chegar ao cliente. Não há exposição de respostas brutas de terceiros.

---

## 2. OWASP Top 10 Web (2021)

### A01 — Broken Access Control

**Status: ✅ RLS + Guards globais**

Coberto na API1 e API5 acima.

---

### A02 — Cryptographic Failures

**Status: ✅ Correto**

✅ JWTs assinados pelo Supabase (RS256)
✅ Senhas gerenciadas pelo Supabase Auth (bcrypt internamente)
✅ Comunicação HTTPS (Railway + Cloudflare)
✅ Áudios em R2 privado — URLs assinadas com expiração curta
✅ API keys nunca no frontend

**Gap:** Não há rotação automática de secrets. Se o `SUPABASE_SERVICE_ROLE_KEY` vazar, não há mecanismo de revogação rápida além de rotacionar manualmente no painel do Supabase.

---

### A03 — Injection

**Status: ✅ Protegido**

O Supabase client usa queries parametrizadas internamente. Não há concatenação de strings em queries SQL. A camada de validação com `class-validator` sanitiza inputs antes de chegarem às queries.

**Gap menor:** O parâmetro `?q=` de busca de transcrições usa `.ilike('%${query}%')` via Supabase SDK, que é seguro contra SQL injection, mas não tem limite de tamanho.

---

### A04 — Insecure Design

**Status: ⚠️ Gaps de design de segurança**

❌ **Não há mecanismo de exclusão de dados do usuário.** Um usuário não pode deletar sua conta e todos os dados associados. Isso é um problema de design e também uma violação da LGPD (direito ao esquecimento).

❌ **Não há log de auditoria.** Não é possível rastrear "quem fez o quê e quando" em caso de incidente.

⚠️ **JWTs stateless** — se um token vazar, não há como invalidá-lo antes da expiração (1h). Não há blacklist de tokens.

---

### A05 — Security Misconfiguration

Coberto na API8 acima.

---

### A06 — Vulnerable and Outdated Components

**Status: 🔵 Não auditado neste documento**

Recomendação: rodar `npm audit` periodicamente tanto no backend quanto no frontend. Configurar Dependabot no GitHub para alertas automáticos.

---

### A07 — Identification and Authentication Failures

**Status: ✅ Delegado ao Supabase**

✅ Supabase Auth gerencia sessões, refresh tokens e expiração
✅ Frontend nunca armazena JWT manualmente (Supabase SDK gerencia)
✅ Email confirmado para login (por padrão no Supabase)

**Gap:** Não há 2FA (autenticação de dois fatores). Para um produto com dados sensíveis de estudo (gravações de voz), 2FA seria recomendado em contas premium.

---

### A08 — Software and Data Integrity Failures

**Status: ✅ Correto**

Não há desserialização de objetos não confiáveis. O `ValidationPipe` com `whitelist: true` rejeita propriedades inesperadas. O pipeline de CI/CD (Railway) usa o código diretamente do repositório.

---

### A09 — Security Logging and Monitoring Failures

**Status: ⚠️ Logging parcial**

✅ `LoggingMiddleware` registra todas as requests HTTP com status, método e duração
✅ `HttpExceptionFilter` loga erros com contexto
✅ Workers NestJS logam progresso de transcrição

**Gap (MÉDIA):** Não há sistema centralizado de logs (ex: Datadog, Sentry, Logtail). Os logs ficam nos logs do Railway e se perdem após um período. Não há alertas automáticos para taxas de erro elevadas.

**Gap (MÉDIA):** Não há log de eventos de autenticação (login bem-sucedido, login falho, token inválido). O `SupabaseAuthGuard` retorna 401 sem logar o IP ou o token rejeitado.

---

### A10 — Server-Side Request Forgery (SSRF)

Coberto na API7 acima.

---

## 3. LGPD (Lei 13.709/2018)

O anotEX.ai processa **dados pessoais** (gravações de voz, transcrições de texto) de usuários brasileiros. A LGPD se aplica integralmente.

### Artigo 18 — Direitos do Titular

| Direito | Status | Observação |
|---------|--------|------------|
| Acesso aos dados | ⚠️ | Usuário vê seus dados via UI, mas não há endpoint de exportação JSON/CSV |
| Correção | ✅ | Usuário pode deletar áudios individualmente |
| Eliminação (Esquecimento) | ❌ | **Não há endpoint de exclusão de conta.** Usuário não pode apagar tudo de uma vez |
| Portabilidade | ❌ | Não há export de dados no formato estruturado |
| Revogação de consentimento | ❌ | Não há fluxo explícito de consentimento nem revogação |
| Informação sobre compartilhamento | ✅ | Dados não são compartilhados com terceiros além dos processadores (Groq, Supabase, R2) |

### Artigo 46 — Medidas de Segurança

| Medida | Status |
|--------|--------|
| Criptografia em trânsito | ✅ HTTPS everywhere |
| Criptografia em repouso | ✅ Supabase e R2 criptografam em repouso |
| Controle de acesso | ✅ RLS + JWT |
| Minimização de dados | ⚠️ Transcrições e resumos retêm dados além do necessário sem política de retenção |

### Artigo 48 — Comunicação de Incidentes

❌ Não há processo documentado para notificação de vazamento de dados à ANPD e aos titulares dentro de 72h.

---

## 4. Resumo Executivo — O que está bem e o que está quebrado

### ✅ O que está correto e bem implementado

| Item | Detalhe |
|------|---------|
| Autenticação global | `APP_GUARD` protege todos os endpoints por padrão |
| RLS no banco | Toda tabela com dado do usuário tem RLS + índices |
| Validação de input | `ValidationPipe` global com whitelist |
| Headers de segurança | `helmet()` habilitado |
| CORS restritivo | Não usa `*` — lista de origins permitidas |
| Sem SQL injection | Supabase SDK com queries parametrizadas |
| Arquivos privados | R2 privado + URLs assinadas com expiração |
| Rate limiting de upload | `UserUploadThrottlerGuard` funcional |
| Sem secrets no frontend | `service_role_key` nunca exposta ao browser |
| Fila assíncrona | Processamento de áudio nunca bloqueia HTTP |
| Detecção de MIME real | `file-type` detecta o tipo real do buffer |
| Erros sem stack trace | `HttpExceptionFilter` nunca expõe stack em produção |

---

### ❌ Vulnerabilidades ativas que precisam de correção

| ID | Severidade | Problema | Arquivo | Fix |
|----|-----------|----------|---------|-----|
| V-01 | 🔴 Alta | Sem rate limit em `/transcription` e `/study-materials` | `transcription.controller.ts`, `study-material.controller.ts` | Adicionar `@Throttle()` |
| V-02 | 🔴 Alta | CORS com possível bypass por whitespace | `main.ts` | `.split(',').map(o => o.trim())` |
| V-03 | 🟠 Média | Sem timeout no `getUser()` do Supabase | `auth.guard.ts` | `Promise.race` com timeout de 5s |
| V-04 | 🟠 Média | `PORT` hardcoded, env var ignorada | `main.ts` | Ler de `configService.get('PORT', 3000)` |
| V-05 | 🟠 Média | Query `?q=` sem limite de tamanho | `transcription.controller.ts` | `@MaxLength(100)` no DTO |
| V-06 | 🟠 Média | Sem log de autenticação falhada (IP, tentativas) | `auth.guard.ts` | Logar tentativas inválidas com IP |
| V-07 | 🟡 Baixa | Log usa MIME type informado pelo cliente | `upload-audio.use-case.ts` | Logar apenas MIME detectado |
| V-08 | 🟡 Baixa | URL de YouTube não valida domínio | `study-folder.module` | Validar que URL começa com `youtube.com` |

---

### ❌ Gaps de conformidade LGPD

| ID | Prioridade | Descrição | Impacto |
|----|-----------|-----------|---------|
| L-01 | 🔴 Alta | Sem endpoint de exclusão de conta e dados | Violação direta do Art. 18 |
| L-02 | 🟠 Média | Sem exportação de dados do usuário | Art. 18 — portabilidade |
| L-03 | 🟠 Média | Sem política de retenção de dados (prazo para deletar áudios antigos) | Art. 15 — eliminação quando desnecessário |
| L-04 | 🟡 Baixa | Sem processo documentado de notificação de incidentes | Art. 48 |

---

## 5. Plano de Correção Priorizado

### Fase 1 — Crítico (fazer antes do próximo lançamento público)

1. **V-01** — Rate limit em `/transcription` e `/study-materials`
2. **V-02** — Fix CORS whitespace
3. **L-01** — Endpoint `DELETE /user` que deleta conta + todos os dados + R2

### Fase 2 — Importante (próximas 2 semanas)

4. **V-03** — Timeout no auth guard
5. **V-04** — Ler PORT do env
6. **V-05** — Validação de tamanho em query params
7. **V-06** — Log de autenticação falhada
8. **L-02** — Endpoint `GET /user/export` para portabilidade de dados

### Fase 3 — Melhorias (backlog)

9. **V-07** — Fix log de MIME
10. **V-08** — Validação de domínio YouTube
11. **L-03** — Política de retenção + cron para deletar dados antigos
12. Sentry ou Logtail para monitoramento centralizado
13. `npm audit` automatizado no CI
14. Documentação de processo de resposta a incidentes

---

## 6. Como usar este documento

Este documento deve ser consultado pelo agente de IA nos seguintes momentos:

- **Ao criar novos endpoints:** verificar V-01 (rate limit), API1 (BOLA), API3 (validação)
- **Ao criar novas tabelas no Supabase:** verificar RLS obrigatório
- **Ao criar novas features de usuário:** verificar gaps de LGPD (L-01, L-02)
- **Ao modificar `main.ts` ou guards:** verificar V-02, V-03, V-04
- **Ao criar features de compartilhamento/grupos:** verificar API5 (autorização de função)
- **Ao processar input do usuário:** verificar A03 (injection), API3 (validação), V-05 (tamanho)
