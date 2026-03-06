# Como testar a API

## Pré-requisitos

- Backend rodando: `npm run start:dev`
- `.env` configurado
- Migration `001_initial_schema.sql` executada no Supabase

---

## 1. Obter um JWT token

O backend usa autenticação via Supabase. Você precisa de um token JWT válido para acessar os endpoints protegidos.

**Opção A — curl:**
```bash
curl -X POST 'https://<SEU_SUPABASE_URL>/auth/v1/token?grant_type=password' \
  -H 'apikey: <SUPABASE_ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"email": "seu@email.com", "password": "suasenha"}'
```

Copie o campo `access_token` da resposta.

**Opção B — Supabase Dashboard:**
Authentication → Users → crie um usuário de teste → use as credenciais acima.

---

## 2. Health check (sem auth)

```bash
curl http://localhost:3000/api/v1/health
```

Resposta esperada:
```json
{ "status": "ok", "timestamp": "..." }
```

---

## 3. Upload de áudio

```bash
curl -X POST http://localhost:3000/api/v1/audio/upload \
  -H 'Authorization: Bearer <TOKEN>' \
  -F 'audio=@/caminho/para/arquivo.webm' \
  -F 'language=pt'
```

Resposta esperada:
```json
{
  "audioId": "uuid-do-audio",
  "transcriptionId": "uuid-da-transcricao",
  "status": "PENDING",
  "fileName": "arquivo.webm",
  "createdAt": "..."
}
```

> O processamento é assíncrono — o job entra na fila do BullMQ.

---

## 4. Verificar status do processamento

```bash
curl http://localhost:3000/api/v1/audio/<AUDIO_ID>/status \
  -H 'Authorization: Bearer <TOKEN>'
```

Resposta quando processando:
```json
{
  "audio": { "id": "...", "status": "PROCESSING", "fileName": "arquivo.webm" },
  "transcription": { "id": "...", "status": "PROCESSING", "transcriptionText": null, "summaryText": null }
}
```

Resposta quando concluído:
```json
{
  "audio": { "id": "...", "status": "COMPLETED", "fileName": "arquivo.webm" },
  "transcription": {
    "id": "...",
    "status": "COMPLETED",
    "transcriptionText": "Texto transcrito da aula...",
    "summaryText": "1. Tópicos principais...",
    "errorMessage": null
  }
}
```

---

## 5. Buscar transcrição completa

```bash
curl http://localhost:3000/api/v1/transcription/<AUDIO_ID> \
  -H 'Authorization: Bearer <TOKEN>'
```

---

## 6. Listar todos os áudios do usuário

```bash
curl http://localhost:3000/api/v1/audio \
  -H 'Authorization: Bearer <TOKEN>'
```

---

## 7. Listar todas as transcrições do usuário

```bash
curl http://localhost:3000/api/v1/transcription \
  -H 'Authorization: Bearer <TOKEN>'
```

---

## 8. Deletar um áudio

```bash
curl -X DELETE http://localhost:3000/api/v1/audio/<AUDIO_ID> \
  -H 'Authorization: Bearer <TOKEN>'
```

---

## Arquivo de áudio para teste

Se não tiver um `.webm` em mãos, gere um rápido com ffmpeg:

```bash
ffmpeg -f lavfi -i "sine=frequency=440:duration=5" -c:a libopus teste.webm
```

Ou grave pelo browser com a MediaRecorder API e salve o blob.

---

## Rodar os testes unitários

```bash
npm run test          # todos os testes
npm run test:watch    # modo watch
npm run test:cov      # com cobertura
```
