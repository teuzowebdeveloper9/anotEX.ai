# anotEX.ai — Guia de Desenvolvimento

## Stack

- **Runtime:** Node.js + NestJS (TypeScript estrito)
- **IA - Transcrição:** Groq Whisper Large v3
- **IA - Resumo:** Groq Llama 3 70B
- **Banco de dados:** Supabase (Postgres + Auth + Storage)
- **Storage de áudio:** Cloudflare R2
- **Fila:** BullMQ + Upstash Redis
- **Deploy:** Railway

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
      infrastructure/   # Implementações concretas (Supabase, Groq, R2)
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
- Providers de IA implementam uma interface comum (`TranscriptionProvider`, `SummaryProvider`)
- Para adicionar novo provider (ex: OpenAI), cria-se uma nova classe sem alterar as existentes

### L — Liskov Substitution
Implementações devem ser substituíveis por suas interfaces sem quebrar o sistema.
- `GroqWhisperProvider` e `CloudflareWhisperProvider` são intercambiáveis via `TranscriptionProvider`

### I — Interface Segregation
Interfaces pequenas e específicas, não interfaces gordas.
- `AudioRepository` não mistura operações de transcrição com operações de storage
- Separe `ITranscriptionProvider` de `ISummaryProvider`

### D — Dependency Inversion
Dependa de abstrações, não de implementações concretas.
- Use cases recebem `ITranscriptionProvider` via injeção de dependência, nunca instanciam `GroqWhisperProvider` diretamente
- Módulos NestJS configuram qual implementação injetar

---

## Padrões de Código

### Nomenclatura

- **Classes:** PascalCase — `TranscribeAudioUseCase`, `AudioRepository`
- **Interfaces:** prefixo `I` — `ITranscriptionProvider`, `IAudioRepository`
- **Arquivos:** kebab-case — `transcribe-audio.use-case.ts`, `audio.repository.ts`
- **Variáveis e funções:** camelCase — `audioBuffer`, `transcribeAudio()`
- **Constantes:** SCREAMING_SNAKE_CASE — `MAX_AUDIO_SIZE_MB`, `GROQ_RATE_LIMIT`
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
| Provider (impl) | `.provider.impl.ts` | `groq-whisper.provider.impl.ts` |
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

- JWT validado via `SupabaseAuthGuard` em todas as rotas protegidas
- Guard aplicado globalmente — rotas públicas marcadas explicitamente com `@Public()`
- Nunca confiar em dados do `user_metadata` do JWT para RLS — usar `auth.uid()` do Supabase
- Tokens com expiração curta (1h); refresh token gerenciado pelo Supabase
- Nunca expor endpoints admin sem verificação de role

```typescript
// Correto
@UseGuards(SupabaseAuthGuard)
@Roles(Role.USER)
async uploadAudio() {}

// Rotas públicas explicitamente marcadas
@Public()
async healthCheck() {}
```

### Validação de Input (API3)

- `ValidationPipe` global com `whitelist: true` — campos extras são removidos automaticamente
- Validar tamanho máximo do arquivo de áudio no pipe antes de processar
- Sanitizar nomes de arquivo antes de salvar no storage
- Nunca usar input do usuário em queries SQL diretas — usar Supabase client com parâmetros

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
- Rate limit para transcrição: respeitar limites do Groq (20 req/min) via fila BullMQ
- Retornar `429 Too Many Requests` com `Retry-After` header

### Headers de Segurança

- `helmet()` habilitado globalmente no `main.ts`
- CORS configurado apenas para origens permitidas (não `*` em produção)
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` em produção

### Dados Sensíveis

- Nunca logar tokens, API keys ou dados de áudio
- Variáveis de ambiente via `@nestjs/config` + schema de validação com Joi
- Nunca commitar `.env` — usar `.env.example` com chaves vazias
- Áudios armazenados no R2 com acesso privado — URLs assinadas com expiração curta

### Tratamento de Erros

- Filtro global de exceções que nunca expõe stack traces em produção
- Respostas de erro padronizadas: `{ statusCode, message, error }`
- Logar erros internos com contexto suficiente, mas sem dados sensíveis
- HTTP 500 genérico para erros inesperados — nunca expor detalhes internos

---

## Row Level Security (RLS) — Supabase

RLS é a principal camada de autorização no banco. **Toda tabela pública deve ter RLS habilitado.**

### Regras obrigatórias

1. Habilitar RLS em todas as tabelas: `ALTER TABLE tabela ENABLE ROW LEVEL SECURITY;`
2. Toda tabela com RLS deve ter pelo menos uma policy — RLS sem policy = nenhum acesso
3. Policies de leitura usam `USING`, policies de escrita usam `WITH CHECK`, UPDATE usa os dois
4. Sempre usar `auth.uid()` para identificar o usuário — nunca confiar em campos da request
5. Criar índice nas colunas usadas em policies RLS para evitar full table scan

### Padrão de policies por tabela

```sql
-- Habilitar RLS
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

-- SELECT: usuário só vê seus próprios registros
CREATE POLICY "users_select_own_audios"
ON audios FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: usuário só insere com seu próprio user_id
CREATE POLICY "users_insert_own_audios"
ON audios FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: usuário só atualiza seus próprios registros
CREATE POLICY "users_update_own_audios"
ON audios FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: usuário só deleta seus próprios registros
CREATE POLICY "users_delete_own_audios"
ON audios FOR DELETE
USING (auth.uid() = user_id);
```

### Índices obrigatórios para RLS

```sql
-- Indexar user_id em todas as tabelas com RLS
CREATE INDEX idx_audios_user_id ON audios(user_id);
CREATE INDEX idx_transcriptions_user_id ON transcriptions(user_id);
```

### Storage RLS (Cloudflare R2 / Supabase Storage)

- Buckets de áudio privados — sem acesso público
- URLs assinadas geradas pelo backend com expiração de 15 minutos
- Nunca expor a URL permanente do R2 para o frontend

### Testar RLS

- Testar sempre pelo client SDK, nunca pelo SQL Editor (que bypassa RLS)
- Verificar que um usuário A não consegue acessar dados do usuário B

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

// Ordem de fallback para transcrição
// 1. Groq Whisper (primário)
// 2. Cloudflare Workers AI Whisper (fallback)

// Ordem de fallback para resumo
// 1. Groq Llama 3 70B (primário)
// 2. Google Gemini Flash (fallback)
```

Erros de rate limit (429) devem acionar o fallback automaticamente, nunca retornar erro para o usuário.

---

## Fila de Processamento (BullMQ)

- Todo processamento de áudio (transcrição + resumo) passa pela fila — nunca processar de forma síncrona no request
- Job com retry automático: 3 tentativas com backoff exponencial
- Status do job exposto via `GET /audio/status/:jobId` (polling do frontend)
- Jobs com falha definitiva atualizam o status no banco para `FAILED` com mensagem de erro

---

## Variáveis de Ambiente

Nunca usar valores hardcoded. Toda configuração via `.env` validado no startup:

```
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # Apenas no backend, nunca expor ao frontend
SUPABASE_ANON_KEY=

# Groq
GROQ_API_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Upstash Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# App
NODE_ENV=development
PORT=3000
JWT_SECRET=
ALLOWED_ORIGINS=http://localhost:3000
MAX_AUDIO_SIZE_MB=100
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
- Nunca expor a `SUPABASE_SERVICE_ROLE_KEY` ao frontend
- Nunca criar tabela no Supabase sem habilitar RLS
- Nunca processar áudio de forma síncrona no request HTTP
- Nunca logar dados sensíveis (tokens, áudio, PII)
- Nunca commitar `.env`
- Nunca usar `*` no CORS em produção
- Nunca confiar em dados do `user_metadata` JWT para autorização

---

## Frontend — Feature-Sliced Design (FSD)

### Stack
- Vite + React 19 + TypeScript strict
- Tailwind CSS v4, Framer Motion, Lucide React
- TanStack Query v5, Zustand, React Router v7
- Supabase JS SDK (Magic Link), Axios com interceptor JWT
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
| `shared` | UI base, axios, supabase client, hooks utilitários, tipos |

### Regras do frontend

- Nunca armazenar JWT manualmente — Supabase SDK gerencia sessão
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend
- Todo acesso ao backend via `shared/api/axios.ts` (interceptor injeta JWT automaticamente)
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
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### O que nunca fazer no frontend
- Nunca quebrar a regra de importação FSD
- Nunca colocar lógica de negócio em `shared/ui`
- Nunca importar de `features` dentro de `entities` ou `shared`
- Nunca exibir logo com fundo branco sobre o dark theme
