# Security Report — anotEX.ai

Auditoria realizada em 2026-03-17.

---

## Findings e Plano de Resolução

### [MEDIUM] FIX-01 — `videoId` sem validação de formato

**Arquivo:** `backend/src/modules/study-folders/application/dto/process-video.dto.ts`

**Problema:**
O campo `videoId` aceita qualquer string de 1–20 chars. Ele é interpolado diretamente em
`https://www.youtube.com/watch?v=${videoId}` e passado ao processo yt-dlp.
IDs válidos do YouTube têm formato fixo: 11 chars `[a-zA-Z0-9_-]`.

**Como resolver:**
Adicionar `@Matches(/^[a-zA-Z0-9_-]{11}$/)` no DTO, rejeitando na camada de validação
antes de qualquer processamento.

```diff
// process-video.dto.ts
- import { IsString, IsNotEmpty, Length } from 'class-validator';
+ import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
+ @Matches(/^[a-zA-Z0-9_-]{11}$/, { message: 'videoId must be a valid YouTube video ID' })
  videoId!: string;
```

**Impacto:** baixo risco de regressão — YouTube IDs são sempre 11 chars nesse formato.

---

### [MEDIUM] FIX-02 — Redirect loop ilimitado no `downloadFile`

**Arquivo:** `backend/src/modules/study-folders/domain/use-cases/process-video.use-case.ts:52`

**Problema:**
A função `follow()` se chama recursivamente a cada `301/302` sem limite.
Uma cadeia circular de redirects causa stack overflow durante o `onModuleInit`,
derrubando o servidor no boot.

**Como resolver:**
Adicionar um contador de redirects com máximo 5. Se exceder, rejeitar com erro.

```diff
- private downloadFile(url: string, dest: string): Promise<void> {
-   return new Promise((resolve, reject) => {
-     const follow = (redirectUrl: string) => {
+ private downloadFile(url: string, dest: string): Promise<void> {
+   return new Promise((resolve, reject) => {
+     const follow = (redirectUrl: string, redirectCount = 0) => {
+       if (redirectCount > 5) {
+         reject(new Error('Too many redirects'));
+         return;
+       }
        https
          .get(redirectUrl, (res) => {
            if (
              (res.statusCode === 301 || res.statusCode === 302) &&
              res.headers.location
            ) {
-             follow(res.headers.location);
+             follow(res.headers.location, redirectCount + 1);
              return;
            }
```

**Impacto:** zero — só afeta o download interno do yt-dlp.

---

### [MEDIUM] FIX-03 — `MAX_AUDIO_SIZE_MB` default de 500MB

**Arquivo:** `backend/src/shared/infrastructure/config/env.validation.ts:23`

**Problema:**
Se `MAX_AUDIO_SIZE_MB` não estiver setada no Railway, o servidor aceita arquivos de
até 500MB. Com retry (3 tentativas na fila), uma requisição maliciosa pode esgotar
memória/disco do container.

**Como resolver:**
Dois passos:

1. Corrigir o default no schema para `100`:
```diff
- MAX_AUDIO_SIZE_MB: Joi.number().default(500),
+ MAX_AUDIO_SIZE_MB: Joi.number().default(100),
```

2. Confirmar no Railway que `MAX_AUDIO_SIZE_MB=100` está setado explicitamente
(não depender de defaults).

**Impacto:** zero — o default menor só afeta ambientes sem a variável configurada.

---

### [LOW] FIX-04 — Query `?q=` sem limite de tamanho

**Arquivo:** `backend/src/modules/transcription/presentation/controllers/transcription.controller.ts:27`

**Problema:**
`@Query('q') search?: string` aceita string de tamanho arbitrário, que é repassada
diretamente para query no banco como filtro. Payloads grandes aumentam custo de query.

**Como resolver:**
Criar um DTO simples para o parâmetro ou aplicar um pipe de transform:

```diff
// transcription.controller.ts
+ import { MaxLength, IsOptional, IsString } from 'class-validator';

  @Get()
  async listMyTranscriptions(
    @Req() req: AuthenticatedRequest,
-   @Query('q') search?: string,
+   @Query('q', new DefaultValuePipe(''), new MaxLengthPipe(200)) search?: string,
  ) {
```

Alternativa mais simples: criar `ListTranscriptionsQueryDto` com `@IsOptional() @IsString() @MaxLength(200)`.

**Impacto:** nenhum para o frontend — queries normais têm menos de 200 chars.

---

### [LOW] FIX-05 — MIME type validado via Content-Type, não magic bytes

**Arquivo:** `backend/src/modules/audio/domain/use-cases/upload-audio.use-case.ts:35`

**Problema:**
`input.file.mimetype` vem do header `Content-Type` definido pelo cliente.
Um atacante pode enviar qualquer arquivo com `Content-Type: audio/webm`.
O arquivo entra no R2 (privado) e vai para o Groq Whisper, que rejeita não-áudio.
Impacto prático é baixo (arquivo indesejado no storage, custo de API desperdiçado).

**Como resolver:**
Usar o pacote `file-type` para detectar o tipo real pelo magic bytes:

```bash
npm install file-type
```

```diff
+ import { fileTypeFromBuffer } from 'file-type';

  async execute(input: UploadAudioInput): Promise<Result<AudioEntity>> {
+   const detected = await fileTypeFromBuffer(input.file.buffer);
+   const mimeToCheck = detected?.mime ?? input.file.mimetype;
+
-   if (!ALLOWED_MIME_TYPES.includes(input.file.mimetype)) {
+   if (!ALLOWED_MIME_TYPES.includes(mimeToCheck)) {
      return fail(new BadRequestException(`Unsupported audio format`));
    }
```

**Impacto:** baixo — `file-type` é leve e não afeta a performance do upload.

---

### [INFO] CHECK-01 — Confirmar variáveis de produção no Railway

**Problema:**
O `HttpExceptionFilter` expõe o `path` da request quando `NODE_ENV !== 'production'`.

**Como verificar:**
```bash
railway variables --service anotex-api | grep NODE_ENV
```

Deve retornar `NODE_ENV=production`. Se não, adicionar via Railway Dashboard.

---

## Status dos Fixes

| ID | Severidade | Status |
|----|------------|--------|
| FIX-01 | MEDIUM | pendente |
| FIX-02 | MEDIUM | pendente |
| FIX-03 | MEDIUM | pendente |
| FIX-04 | LOW | pendente |
| FIX-05 | LOW | pendente |
| CHECK-01 | INFO | pendente |

---

## O que NÃO precisa mudar

- Arquitetura de auth (guard global + `@Public()`) — correta
- CORS configurado por env var — correto
- `ParseUUIDPipe` em todos os IDs — correto
- `userId` sempre do JWT — correto
- Rate limiting em dois níveis — correto
- Sanitização de filename — correta
- Helmet + ValidationPipe globais — corretos
- Frontend sem JWT em localStorage — correto
