# anotEX.ai - Documentação de Pesquisa

## 📚 Captura de Áudio em Tempo Real - Backend

Documentação sobre ferramentas e abordagens para captura de áudio em tempo real para dois cenários principais:

1. **🖥️ Áudio do sistema** (aula online - captura o que está tocando no PC)
2. **🎤 Microfone** (aula presencial - captura voz ao vivo)

---

## 🎯 Arquitetura Geral

```
┌─────────────────┐     WebSocket/Stream      ┌─────────────────┐
│    Frontend     │ ──────────────────────►   │     Backend     │
│  (Captura áudio)│                           │  (Processa/Salva)│
└─────────────────┘                           └─────────────────┘
        │                                              │
        ▼                                              ▼
   MediaRecorder API                           Transcrição/Storage
   (Browser captura)                           (Whisper, S3, etc)
```

---

## 🌐 Frontend (Captura no Browser)

A captura **sempre começa no frontend** - o backend recebe o stream.

```javascript
// Captura MICROFONE (aula presencial)
const micStream = await navigator.mediaDevices.getUserMedia({ 
  audio: true 
});

// Captura ÁUDIO DO SISTEMA (aula online)
const systemStream = await navigator.mediaDevices.getDisplayMedia({ 
  audio: true,  // Captura áudio do sistema
  video: true   // Necessário, mas pode ignorar o vídeo
});

// Gravar e enviar em chunks
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus'
});

mediaRecorder.ondataavailable = (event) => {
  // Envia chunk via WebSocket para o backend
  websocket.send(event.data);
};

mediaRecorder.start(1000); // Chunk a cada 1 segundo
```

---

## 🟢 Node.js / NestJS

### Bibliotecas Recomendadas

| Lib | Uso |
|-----|-----|
| **`ws`** ou **`socket.io`** | WebSocket para receber stream em tempo real |
| **`fluent-ffmpeg`** | Processar/converter áudio |
| **`node-wav`** | Manipular arquivos WAV |
| **`@nestjs/websockets`** | WebSocket nativo do NestJS |
| **`naudiodon`** | Captura de áudio nativo (se backend capturar direto) |

### Exemplo NestJS - Gateway WebSocket

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
    // Cria arquivo para salvar o áudio do cliente
    const filePath = `./uploads/audio-${client.id}-${Date.now()}.webm`;
    const writeStream = fs.createWriteStream(filePath);
    this.audioStreams.set(client.id, writeStream);
    
    console.log(`Cliente conectado: ${client.id}`);
  }

  @SubscribeMessage('audio-chunk')
  handleAudioChunk(client: Socket, chunk: Buffer) {
    const stream = this.audioStreams.get(client.id);
    if (stream) {
      stream.write(chunk);
    }
  }

  @SubscribeMessage('audio-stop')
  handleAudioStop(client: Socket) {
    const stream = this.audioStreams.get(client.id);
    if (stream) {
      stream.end();
      this.audioStreams.delete(client.id);
      // Aqui você pode processar o arquivo (transcrição, etc)
    }
  }
}
```

---

## ☕ Java / Spring Boot

### Bibliotecas Recomendadas

| Lib | Uso |
|-----|-----|
| **Spring WebSocket** | Receber stream em tempo real |
| **TarsosDSP** | Processamento de áudio (DSP) |
| **javax.sound.sampled** | API nativa Java para áudio |
| **JLayer** | Decodificar MP3 |
| **FFmpeg wrapper (Jaffree)** | Processar áudio com FFmpeg |

### Exemplo Spring Boot - WebSocket Handler

```java
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;
import java.io.*;
import java.nio.file.*;

@Component
public class AudioWebSocketHandler extends BinaryWebSocketHandler {

    private final Map<String, OutputStream> audioStreams = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String filePath = "uploads/audio-" + session.getId() + "-" + System.currentTimeMillis() + ".webm";
        OutputStream outputStream = new FileOutputStream(filePath);
        audioStreams.put(session.getId(), outputStream);
        
        System.out.println("Cliente conectado: " + session.getId());
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
            // Processar arquivo aqui (transcrição, etc)
        }
    }
}
```

### Configuração WebSocket (Spring Boot)

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private AudioWebSocketHandler audioHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(audioHandler, "/audio-stream")
                .setAllowedOrigins("*");
    }
}
```

---

## 🔷 C# / ASP.NET Core

### Bibliotecas Recomendadas

| Lib | Uso |
|-----|-----|
| **SignalR** | WebSocket simplificado (recomendo!) |
| **NAudio** | Captura e processamento de áudio |
| **CSCore** | Alternativa ao NAudio |
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
        
        Console.WriteLine($"Cliente conectado: {Context.ConnectionId}");
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

    public async Task StopRecording()
    {
        if (AudioStreams.TryGetValue(Context.ConnectionId, out var stream))
        {
            await stream.DisposeAsync();
            AudioStreams.Remove(Context.ConnectionId);
            // Processar arquivo aqui
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

### Program.cs (ASP.NET Core)

```csharp
builder.Services.AddSignalR();

// ...

app.MapHub<AudioHub>("/audio-hub");
```

---

## 🐍 Python / FastAPI

### Bibliotecas Recomendadas

| Lib | Uso |
|-----|-----|
| **websockets** / **FastAPI WebSocket** | Receber stream |
| **pyaudio** | Captura de áudio nativo |
| **pydub** | Manipulação de áudio |
| **soundfile** | Ler/escrever arquivos de áudio |
| **faster-whisper** | Transcrição em tempo real |

### Exemplo FastAPI

```python
from fastapi import FastAPI, WebSocket
import aiofiles
import time

app = FastAPI()

@app.websocket("/audio-stream")
async def audio_stream(websocket: WebSocket):
    await websocket.accept()
    
    filename = f"uploads/audio-{websocket.client.host}-{int(time.time())}.webm"
    
    async with aiofiles.open(filename, 'wb') as f:
        try:
            while True:
                chunk = await websocket.receive_bytes()
                await f.write(chunk)
        except Exception:
            pass  # Conexão fechada
    
    # Processar arquivo aqui (transcrição, etc)
```

---

## 🎯 Resumo - Comparativo de Tecnologias

| Tecnologia | Melhor Lib | Facilidade | Performance |
|------------|------------|------------|-------------|
| **NestJS** | `socket.io` + `fluent-ffmpeg` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Spring Boot** | Spring WebSocket + Jaffree | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **ASP.NET** | SignalR + NAudio | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Python** | FastAPI WebSocket | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 💡 Recomendação para o anotEx.ai

Se você já está usando **Node.js/NestJS**, a stack recomendada é:

- **Frontend:** MediaRecorder API
- **Backend:** NestJS WebSocket Gateway + Socket.io
- **Processamento:** FFmpeg para converter + Whisper para transcrever

---

## 📝 Próximos Passos

- [ ] Definir stack de backend (NestJS recomendado)
- [ ] Implementar captura de áudio no frontend
- [ ] Configurar WebSocket para streaming
- [ ] Integrar com serviço de transcrição (Whisper)
- [ ] Implementar storage para arquivos de áudio

---

*Documentação criada em: Março 2026*

