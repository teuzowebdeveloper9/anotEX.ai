# anotEX.ai - Documentação de Pesquisa

## Captura de Áudio em Tempo Real - Backend

Documentação sobre ferramentas e abordagens para captura de áudio em tempo real para dois cenários principais:

1. **Áudio do sistema** (aula online - captura o que está tocando no PC)
2. **Microfone** (aula presencial - captura voz ao vivo)

---

## Arquitetura Geral

```
┌─────────────────┐     Upload HTTP / WebSocket     ┌─────────────────┐
│    Frontend     │ ──────────────────────────────► │     Backend     │
│  (Captura áudio)│                                 │  (Processa/Salva)│
└─────────────────┘                                 └─────────────────┘
        │                                                    │
        ▼                                                    ▼
   MediaRecorder API                               Transcrição/Storage
   (Browser grava localmente)                      (Whisper, R2, etc)
```

**Decisão de arquitetura para MVP:** O frontend grava o áudio localmente no browser e faz upload do arquivo completo via HTTP quando o usuário para a gravação. WebSocket com streaming em tempo real adiciona complexidade significativa sem benefício real para a maioria dos usuários — fica para fase 2.

---

## Frontend (Captura no Browser)

A captura **sempre começa no frontend** — o backend recebe o arquivo.

```javascript
// Captura MICROFONE (aula presencial)
const micStream = await navigator.mediaDevices.getUserMedia({
  audio: true
});

// Captura AUDIO DO SISTEMA (aula online)
// ATENCAO: requer que o usuario clique em "compartilhar aba/janela com audio"
// Nao funciona em todos os navegadores (Firefox nao suporta audio do sistema)
const systemStream = await navigator.mediaDevices.getDisplayMedia({
  audio: true,
  video: true   // Obrigatorio pela API, mas pode ignorar o video
});

// Gravar em chunks locais e depois fazer upload
const chunks = [];
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus'
});

mediaRecorder.ondataavailable = (event) => {
  chunks.push(event.data);
};

mediaRecorder.onstop = async () => {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  // Upload do arquivo completo ao parar
  const formData = new FormData();
  formData.append('audio', blob, 'aula.webm');
  const res = await fetch('/api/audio/upload', { method: 'POST', body: formData });
  const { jobId } = await res.json();
  // Polling para saber quando a transcricao ficou pronta
  pollStatus(jobId);
};

mediaRecorder.start();
```

**Estimativa de tamanho de arquivo:**
- `audio/webm;codecs=opus` a 32kbps (minimo): ~14MB/hora
- `audio/webm;codecs=opus` a 64kbps (qualidade razoavel): ~28MB/hora
- Considere isso ao dimensionar storage.

---

## Node.js / NestJS

> **MVP:** Use upload HTTP. WebSocket para streaming real-time e fase 2+.

### Bibliotecas Recomendadas

| Lib | Uso | Fase |
|-----|-----|------|
| **`@nestjs/platform-express`** + multer | Upload HTTP de arquivo | MVP |
| **`fluent-ffmpeg`** | Processar/converter audio | MVP |
| **`node-wav`** | Manipular arquivos WAV | MVP |
| **`ws`** ou **`socket.io`** | WebSocket para streaming real-time | Fase 2+ |
| **`@nestjs/websockets`** | WebSocket nativo do NestJS | Fase 2+ |

### Exemplo NestJS - Upload HTTP (MVP)

```typescript
import { Controller, Post, Get, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('audio')
export class AudioController {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    const jobId = await this.transcriptionService.enqueue(file.buffer);
    return { jobId };
  }

  @Get('status/:jobId')
  async getStatus(@Param('jobId') jobId: string) {
    return this.transcriptionService.getStatus(jobId);
  }
}
```

### Exemplo NestJS - WebSocket Gateway (Fase 2+, real-time)

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as fs from 'fs';

@WebSocketGateway({ cors: true })
export class AudioGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private audioStreams: Map<string, fs.WriteStream> = new Map();

  handleConnection(client: Socket) {
    const filePath = `./uploads/audio-${client.id}-${Date.now()}.webm`;
    const writeStream = fs.createWriteStream(filePath);
    this.audioStreams.set(client.id, writeStream);
  }

  @SubscribeMessage('audio-chunk')
  handleAudioChunk(client: Socket, chunk: Buffer) {
    const stream = this.audioStreams.get(client.id);
    if (stream) stream.write(chunk);
  }

  @SubscribeMessage('audio-stop')
  handleAudioStop(client: Socket) {
    const stream = this.audioStreams.get(client.id);
    if (stream) {
      stream.end();
      this.audioStreams.delete(client.id);
    }
  }
}
```

---

## Java / Spring Boot

### Bibliotecas Recomendadas

| Lib | Uso |
|-----|-----|
| **Spring WebSocket** | Receber stream em tempo real |
| **TarsosDSP** | Processamento de audio (DSP) |
| **javax.sound.sampled** | API nativa Java para audio |
| **JLayer** | Decodificar MP3 |
| **FFmpeg wrapper (Jaffree)** | Processar audio com FFmpeg |

### Exemplo Spring Boot - WebSocket Handler

```java
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;
import java.io.*;

@Component
public class AudioWebSocketHandler extends BinaryWebSocketHandler {

    private final Map<String, OutputStream> audioStreams = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String filePath = "uploads/audio-" + session.getId() + "-" + System.currentTimeMillis() + ".webm";
        OutputStream outputStream = new FileOutputStream(filePath);
        audioStreams.put(session.getId(), outputStream);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        OutputStream stream = audioStreams.get(session.getId());
        if (stream != null) {
            byte[] audioData = message.getPayload().array();
            stream.write(audioData);
            stream.flush();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        OutputStream stream = audioStreams.remove(session.getId());
        if (stream != null) {
            stream.close();
        }
    }
}
```

---

## C# / ASP.NET Core

### Bibliotecas Recomendadas

| Lib | Uso |
|-----|-----|
| **SignalR** | WebSocket simplificado |
| **NAudio** | Captura e processamento de audio |
| **FFMpegCore** | Wrapper FFmpeg para .NET |

### Exemplo ASP.NET Core - SignalR Hub

```csharp
using Microsoft.AspNetCore.SignalR;

public class AudioHub : Hub
{
    private static readonly Dictionary<string, FileStream> AudioStreams = new();

    public override async Task OnConnectedAsync()
    {
        var filePath = $"uploads/audio-{Context.ConnectionId}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.webm";
        var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write);
        AudioStreams[Context.ConnectionId] = stream;
        await base.OnConnectedAsync();
    }

    public async Task SendAudioChunk(byte[] chunk)
    {
        if (AudioStreams.TryGetValue(Context.ConnectionId, out var stream))
        {
            await stream.WriteAsync(chunk);
            await stream.FlushAsync();
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (AudioStreams.TryGetValue(Context.ConnectionId, out var stream))
        {
            await stream.DisposeAsync();
            AudioStreams.Remove(Context.ConnectionId);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
```

---

## Python / FastAPI

### Bibliotecas Recomendadas

| Lib | Uso |
|-----|-----|
| **FastAPI** + UploadFile | Upload HTTP de arquivo (MVP) |
| **websockets** / FastAPI WebSocket | Streaming real-time (Fase 2+) |
| **pydub** | Manipulacao de audio |
| **faster-whisper** | Transcricao local |

### Exemplo FastAPI - Upload HTTP (MVP)

```python
from fastapi import FastAPI, UploadFile, File
import asyncio

app = FastAPI()

@app.post("/audio/upload")
async def upload_audio(audio: UploadFile = File(...)):
    content = await audio.read()
    job_id = await transcription_service.enqueue(content)
    return {"jobId": job_id}

@app.get("/audio/status/{job_id}")
async def get_status(job_id: str):
    return transcription_service.get_status(job_id)
```

---

## Resumo - Comparativo de Tecnologias

| Tecnologia | MVP (Upload HTTP) | Real-time (WebSocket) | Facilidade | Performance |
|------------|-------------------|-----------------------|------------|-------------|
| **NestJS** | Simples | socket.io + fluent-ffmpeg | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Spring Boot** | Simples | Spring WebSocket + Jaffree | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **ASP.NET** | Simples | SignalR + NAudio | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Python** | Simples | FastAPI WebSocket | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## Recomendacao para o anotEx.ai

Stack recomendada para **MVP** (zero custo):

- **Frontend:** MediaRecorder API + upload HTTP ao parar gravacao
- **Backend:** Supabase Edge Functions (sem servidor, sem cold start, timeout de 400s)
- **IA:** Groq Whisper (transcricao) + Groq Llama 3 70B (resumo)
- **DB/Auth/Storage:** Supabase

Para **Fase 2** (real-time, feature premium):
- **Backend:** NestJS + Socket.io WebSocket Gateway
- Necessario servidor que nao dorme (Railway, DigitalOcean, Fly.io)

---

## Proximos Passos

- [ ] Implementar captura de audio no frontend (upload HTTP)
- [ ] Configurar Supabase (DB + auth + storage)
- [ ] Integrar Groq Whisper para transcricao
- [ ] Integrar Groq Llama 3 70B para resumo
- [ ] Implementar polling de status no frontend
- [ ] Fase 2: WebSocket para transcricao em tempo real

---

*Documentacao criada em: Marco 2026*
