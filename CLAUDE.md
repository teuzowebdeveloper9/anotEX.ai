# anotEX.ai — Guia de Desenvolvimento

## Stack

- **Runtime:** Node.js + NestJS (TypeScript estrito)
- **IA - Transcrição:** OpenAI Whisper (whisper-1)
- **IA - Resumo/Chat/Materiais:** OpenAI gpt-4o-mini
- **Banco de dados:** Azure Database for PostgreSQL Flexible Server (acesso via `pg`, SQL parametrizado)
- **Auth:** própria — magic link (Azure Communication Services Email) + email/senha (bcrypt), JWT HS256
- **Storage de áudio:** Azure Blob Storage (SAS urls)
- **Fila:** Bull + Azure Managed Redis (TLS, porta 10000)
- **Deploy:** Azure Container Apps (api + worker) + Azure Static Web Apps (frontend)

---

## Arquitetura — Clean Architecture

O projeto segue Clean Architecture com separação rígida de camadas. A regra de ouro: **dependências sempre apontam para dentro** (do externo para o domínio, nunca o contrário).

```
src/
  modules/
    audio/
      domain/           # Entidades, interfaces, regras de negócio puras
        entities/
        repositories/   # Interfaces (contratos)
        use-cases/      # Casos de uso (regras de aplicação)
      application/      # Orquestração, DTOs, casos de uso NestJS
        dto/
        services/
      infrastructure/   # Implementações concretas (Postgres, OpenAI, Azure Blob)
        repositories/
        providers/
      presentation/     # Controllers, Guards, Pipes
        controllers/
        guards/
  shared/
    domain/             # Entidades e interfaces compartilhadas
    infrastructure/     # Config, helpers, providers globais
    presentation/       # Filtros, interceptors, pipes globais
```

### Regras de camada

- `domain/` nunca importa de `infrastructure/` ou `presentation/`
- `domain/` nunca importa de bibliotecas externas (NestJS, Prisma, etc.)
- `use-cases/` dependem apenas de interfaces (repositórios abstratos), nunca de implementações
- `infrastructure/` implementa as interfaces definidas em `domain/`
- `presentation/` chama apenas `application/services/` ou `use-cases/`

---

## Princípios SOLID

### S — Single Responsibility
Cada classe tem uma única razão para mudar.
- Um service por caso de uso (`TranscribeAudioUseCase`, `SummarizeTranscriptionUseCase`)
- Controllers apenas recebem requisições e delegam — sem lógica de negócio
- Repositórios apenas fazem acesso a dados — sem lógica de negócio

### O — Open/Closed
Aberto para extensão, fechado para modificação.
- Providers de IA implementam uma interface comum (`ITranscriptionProvider`, `ISummaryProvider`)
- Para adicionar novo provider (ex: Groq, Azure OpenAI), cria-se uma nova classe sem alterar as existentes

### L — Liskov Substitution
Implementações devem ser substituíveis por suas interfaces sem quebrar o sistema.
- `OpenAiWhisperProviderImpl` e qualquer provider futuro são intercambiáveis via `ITranscriptionProvider`

### I — Interface Segregation
Interfaces pequenas e específicas, não interfaces gordas.
- `AudioRepository` não mistura operações de transcrição com operações de storage
- Separe `ITranscriptionProvider` de `ISummaryProvider`

### D — Dependency Inversion
Dependa de abstrações, não de implementações concretas.
- Use cases recebem `ITranscriptionProvider` via injeção de dependência, nunca instanciam `OpenAiWhisperProviderImpl` diretamente
- Módulos NestJS configuram qual implementação injetar

---

## Padrões de Código

### Nomenclatura

- **Classes:** PascalCase — `TranscribeAudioUseCase`, `AudioRepository`
- **Interfaces:** prefixo `I` — `ITranscriptionProvider`, `IAudioRepository`
- **Arquivos:** kebab-case — `transcribe-audio.use-case.ts`, `audio.repository.ts`
- **Variáveis e funções:** camelCase — `audioBuffer`, `transcribeAudio()`
- **Constantes:** SCREAMING_SNAKE_CASE — `MAX_AUDIO_SIZE_MB`, `MAGIC_LINK_EXPIRES_IN_MINUTES`
- **Enums:** PascalCase com valores SCREAMING_SNAKE_CASE

### Sufixos obrigatórios por tipo

| Tipo | Sufixo | Exemplo |
|------|--------|---------|
| Caso de uso | `.use-case.ts` | `upload-audio.use-case.ts` |
| Controller | `.controller.ts` | `audio.controller.ts` |
| Service | `.service.ts` | `transcription.service.ts` |
| Repository (interface) | `.repository.ts` | `audio.repository.ts` |
| Repository (impl) | `.repository.impl.ts` | `audio.repository.impl.ts` |
| Provider (interface) | `.provider.ts` | `transcription.provider.ts` |
| Provider (impl) | `.provider.impl.ts` | `openai-whisper.provider.impl.ts` |
| DTO | `.dto.ts` | `upload-audio.dto.ts` |
| Entity | `.entity.ts` | `audio.entity.ts` |
| Guard | `.guard.ts` | `auth.guard.ts` |
| Filter | `.filter.ts` | `http-exception.filter.ts` |
| Interceptor | `.interceptor.ts` | `logging.interceptor.ts` |

### TypeScript

- `strict: true` sempre habilitado
- Proibido usar `any` — use `unknown` e faça type narrowing
- Prefira `readonly` em propriedades de entidades de domínio
- Sempre tipar retornos de funções públicas explicitamente
- Use `Result<T, E>` pattern para operações que podem falhar no domínio

### DTOs

- Todo DTO usa `class-validator` + `class-transformer`
- Use `@IsUUID()`, `@IsString()`, `@IsEnum()` — nunca confie em dados crus
- Aplique `ValidationPipe` globalmente com `whitelist: true` e `forbidNonWhitelisted: true`

---

## Segurança (OWASP API Top 10)

### Autenticação e Autorização (API1, API2, API5)

- Auth própria em `modules/auth`: magic link por email (Azure Communication Services) + login email/senha com hash `bcryptjs`
- JWT validado via `JwtAuthGuard` (`modules/audio/presentation/guards/auth.guard.ts`) — validação local do HS256, sem chamada externa
- Guard aplicado globalmente — rotas públicas marcadas explicitamente com `@Public()`
- Access token JWT HS256 com expiração de 1h; refresh token opaco rotacionado a cada uso, validade de 30 dias
- Identidade do usuário vem exclusivamente de `req.user.id` (extraído do JWT pelo guard) — nunca de campos do body/query
- Nunca expor endpoints admin sem verificação de role

```typescript
// Guard global — toda rota é protegida por padrão
async uploadAudio(@Req() req: AuthenticatedRequest) {
  const userId = req.user.id; // única fonte de identidade
}

// Rotas públicas explicitamente marcadas
@Public()
async healthCheck() {}
```

### Validação de Input (API3)

- `ValidationPipe` global com `whitelist: true` — campos extras são removidos automaticamente
- Validar tamanho máximo do arquivo de áudio no pipe antes de processar
- Sanitizar nomes de arquivo antes de salvar no storage
- Nunca usar input do usuário em queries SQL diretas — sempre SQL parametrizado via `pg` (`PostgresService`)

```typescript
// Global no main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

### Rate Limiting (API4)

- `@nestjs/throttler` aplicado globalmente: 100 req/min por IP
- Rate limit específico para upload de áudio: 10 uploads/hora por usuário
- Rate limit para transcrição: respeitar os limites da OpenAI via fila Bull (processamento assíncrono)
- Retornar `429 Too Many Requests` com `Retry-After` header

### Headers de Segurança

- `helmet()` habilitado globalmente no `main.ts`
- CORS configurado apenas para origens permitidas (não `*` em produção)
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` em produção

### Dados Sensíveis

- Nunca logar tokens, API keys ou dados de áudio
- Variáveis de ambiente via `@nestjs/config` + schema de validação com Joi
- Nunca commitar `.env` — usar `.env.example` com chaves vazias; em produção, segredos ficam nos secrets do Azure Container Apps
- Áudios armazenados no Azure Blob Storage com acesso privado — SAS URLs com expiração de 15 minutos

### Tratamento de Erros

- Filtro global de exceções que nunca expõe stack traces em produção
- Respostas de erro padronizadas: `{ statusCode, message, error }`
- Logar erros internos com contexto suficiente, mas sem dados sensíveis
- HTTP 500 genérico para erros inesperados — nunca expor detalhes internos

---

## Autorização de Dados

Não há RLS no banco — a autorização é feita inteiramente na camada de aplicação.

- Toda query em tabela multi-tenant filtra por `user_id` vindo do JWT (`req.user.id`, injetado pelo `JwtAuthGuard` global)
- Repositórios sempre recebem `userId` como parâmetro — nunca buscam ou alteram registros sem esse filtro
- Acesso ao banco exclusivamente via `pg` com SQL parametrizado (`PostgresService` global em `shared/infrastructure/config/postgres.config.ts`)
- Índices em `user_id` são obrigatórios em todas as tabelas multi-tenant
- Storage: Azure Blob privado (container `audios`) — acesso apenas via SAS URLs de 15 minutos geradas pelo backend; nunca expor URL permanente do Blob
- Schema canônico do banco: `infra/azure-postgres-schema.sql`
- Testar sempre que um usuário A não consegue acessar dados do usuário B

---
## Providers de IA — Padrão de Fallback

```typescript
// Interface obrigatória para todos os providers
interface ITranscriptionProvider {
  transcribe(audio: Buffer, language?: string): Promise<string>;
}

interface ISummaryProvider {
  summarize(text: string, prompt: string): Promise<string>;
}

// Provider atual (único): OpenAI
// - Transcrição: whisper-1 (com segments)
// - Resumo, título, chat streaming, flashcards/mindmap/quiz e query do YouTube: gpt-4o-mini
```

As interfaces (`ITranscriptionProvider`, `ISummaryProvider`, etc.) são preservadas para permitir adicionar providers de fallback no futuro sem alterar use-cases. Quando houver fallback configurado, erros de rate limit (429) devem acioná-lo automaticamente, nunca retornar erro para o usuário.

---

## Fila de Processamento (Bull + Azure Managed Redis)

- Todo processamento de áudio (transcrição + resumo) passa pela fila — nunca processar de forma síncrona no request
- Job com retry automático: 3 tentativas com backoff exponencial
- Status do job exposto via `GET /audio/status/:jobId` (polling do frontend)
- Jobs com falha definitiva atualizam o status no banco para `FAILED` com mensagem de erro

---

## Variáveis de Ambiente

Nunca usar valores hardcoded. Toda configuração via `.env` validado no startup — a lista canônica (schema Joi) está em `backend/src/shared/infrastructure/config/env.validation.ts`. Em produção, os valores ficam nos secrets/env vars do Azure Container Apps.

```
# App
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173

# Azure Database for PostgreSQL
DATABASE_URL=

# Auth própria (magic link + JWT)
JWT_SECRET=                        # mínimo 32 caracteres
JWT_EXPIRES_IN=1h
MAGIC_LINK_EXPIRES_IN_MINUTES=15
FRONTEND_URL=

# Azure Communication Services (envio dos magic links)
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

# AbacatePay (opcionais)
ABACATEPAY_API_KEY=
ABACATEPAY_API_BASE_URL=https://api.abacatepay.com/v2
ABACATEPAY_WEBHOOK_SECRET=
ABACATEPAY_PUBLIC_HMAC_KEY=
ABACATEPAY_PRODUCTS=                # catálogo autoritativo "productId:precoCentavos:Nome" (preço nunca vem do cliente)
ABACATEPAY_RETURN_URL=
ABACATEPAY_COMPLETION_URL=

# Limites
MAX_AUDIO_SIZE_MB=100
SIGNED_URL_EXPIRES_IN_SECONDS=900

# YouTube
YOUTUBE_API_KEY=
```

---

## Testes

### Obrigatoriedade

Todo código novo deve ter testes unitários. PRs sem testes não são aceitos.

### O que testar

| Camada | O que testar |
|--------|-------------|
| `use-cases` | Todos os fluxos: caminho feliz, erros esperados (not found, forbidden, bad request) |
| `controllers` | Status HTTP correto, delegação ao use-case, resposta mapeada |
| `guards` | Token ausente, token inválido, rota pública, rota protegida |
| `providers` | Chamada correta à API externa, tratamento de erro |
| `repositories` | Não testados unitariamente — cobertos por testes de integração futuros |

### Padrões

- Framework: **Jest** (já incluso no NestJS)
- Um arquivo de teste por arquivo de produção: `upload-audio.use-case.spec.ts`
- Localização: mesmo diretório do arquivo testado
- Sempre usar mocks para dependências externas (repositórios, providers, filas)
- Nomear os describes em português, its em português

```typescript
// Estrutura padrão
describe('UploadAudioUseCase', () => {
  let useCase: UploadAudioUseCase;
  let audioRepository: jest.Mocked<IAudioRepository>;
  let storageRepository: jest.Mocked<IStorageRepository>;

  beforeEach(() => {
    audioRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      // ...
    } as jest.Mocked<IAudioRepository>;

    useCase = new UploadAudioUseCase(audioRepository, storageRepository, configService);
  });

  describe('execute', () => {
    it('deve retornar erro se o MIME type não for permitido', async () => {});
    it('deve retornar erro se o arquivo exceder o tamanho máximo', async () => {});
    it('deve salvar no storage e criar registro no banco com sucesso', async () => {});
  });
});
```

### Cobertura mínima

- Use-cases: **100%** de cobertura de branches
- Controllers: **80%**
- Guards: **100%**

### Comandos

```bash
npm run test           # roda todos os testes unitários
npm run test:watch     # modo watch
npm run test:cov       # gera relatório de cobertura
```

---

## Commits

- Padrão Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Mensagem em inglês, imperativo, sem ponto final
- Escopo opcional: `feat(audio): add upload endpoint`

---

## O que nunca fazer

- Nunca usar `any` no TypeScript
- Nunca colocar lógica de negócio em controllers
- Nunca acessar o banco diretamente de um use-case — sempre via repositório
- Nunca expor `AZURE_STORAGE_KEY`, `JWT_SECRET` ou `ACS_CONNECTION_STRING` ao frontend
- Nunca criar query sem filtro de `user_id` em tabela multi-tenant
- Nunca guardar segredo fora dos secrets do Azure Container Apps (nem em imagem Docker, nem em código)
- Nunca processar áudio de forma síncrona no request HTTP
- Nunca logar dados sensíveis (tokens, áudio, PII)
- Nunca commitar `.env`
- Nunca usar `*` no CORS em produção
- Nunca confiar em campos do body/query para identificar o usuário — sempre `req.user.id` do JWT

---

## Frontend — Feature-Sliced Design (FSD)

### Stack
- Vite + React 19 + TypeScript strict
- Tailwind CSS v4, Framer Motion, Lucide React
- TanStack Query v5, Zustand, React Router v7
- Auth própria via `shared/auth/auth-client.ts`, Axios com interceptor JWT
- Sonner (toasts)

### Arquitetura FSD — Camadas e regra de importação

```
app → pages → widgets → features → entities → shared
```

Camadas superiores importam das inferiores. **Nunca o contrário.**

| Camada | Responsabilidade |
|--------|-----------------|
| `app` | Providers globais, router, estilos globais |
| `pages` | Composição de widgets/features por rota |
| `widgets` | Blocos de UI independentes (Navbar, RecordingPanel, MouseLight) |
| `features` | Ações do usuário (login, gravar, deletar, copiar) |
| `entities` | Modelos de negócio com UI e queries (Audio, Transcription, User) |
| `shared` | UI base, axios, auth-client, hooks utilitários, tipos |

### Regras do frontend

- Tokens gerenciados exclusivamente pelo `shared/auth/auth-client.ts` (localStorage), nunca em outro lugar
- Refresh de token com single-flight (uma única requisição de refresh por vez) — já implementado no auth-client, não duplicar
- Todo acesso ao backend via `shared/api/axios.ts` (interceptor injeta JWT automaticamente e refaz a requisição após refresh em 401)
- Polling de status via TanStack Query `refetchInterval` condicional (5s se PENDING/PROCESSING)
- Gravação: MediaRecorder API, formato `audio/webm;codecs=opus`
- Zero emojis na UI — ícones exclusivamente via Lucide React
- Dark-first: fundo base `#080a0f`, accent indigo `#6366f1`
- Landing page com luz radial seguindo o mouse via `widgets/mouse-light` (mousemove → CSS custom props → radial-gradient)

### Assets
- `shared/assets/logo-favicon.png` — favicon + logo Navbar (fundo transparente)
- `shared/assets/logo-hero.png` — hero da landing page
- `shared/assets/landing-bg.png` — seção secundária / decorativo
- Sempre usar `mix-blend-mode: lighten` para integrar logos ao dark theme

### Variáveis de ambiente
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Única env var do frontend. Em produção (Azure Static Web Apps): `https://anotex-api.calmhill-a7701bda.brazilsouth.azurecontainerapps.io/api/v1`.

### O que nunca fazer no frontend
- Nunca quebrar a regra de importação FSD
- Nunca colocar lógica de negócio em `shared/ui`
- Nunca importar de `features` dentro de `entities` ou `shared`
- Nunca exibir logo com fundo branco sobre o dark theme
