# Feature: Chat com a Aula (RAG)

## Visão Geral

Interface de chat onde o aluno faz perguntas sobre o conteúdo de uma aula específica. A IA responde com base **exclusivamente** na transcrição daquela aula, sem alucinar conteúdo externo.

Rota: `/transcription/:id/chat`

---

## Arquitetura — RAG Simples (sem Vector DB)

### Por que não usar vector DB?

A maioria das aulas universitárias tem entre 1h e 3h de duração. Com Groq Whisper, isso gera transcrições de aproximadamente 5.000 a 30.000 tokens. O Llama 3.3 70B suporta **128k tokens de context window**, então para a maioria dos casos é possível jogar a transcrição inteira no prompt — mais simples, mais barato e sem latência de embedding/busca.

### Estratégia por tamanho da transcrição

| Tamanho da transcrição | Estratégia |
|------------------------|------------|
| < 50k tokens | Full context: transcrição inteira no prompt |
| 50k – 100k tokens | Full context com truncagem dos extremos menos relevantes |
| > 100k tokens | Chunking + TF-IDF para selecionar os N chunks mais relevantes antes de montar o prompt |

### Estimativa de tokens

- 1 palavra ≈ 1.3 tokens (português)
- Aula de 1h ≈ 8.000–12.000 palavras ≈ 10.000–16.000 tokens
- Aula de 3h ≈ 24.000–36.000 palavras ≈ 30.000–47.000 tokens
- Limite seguro para full context: transcrições com até ~70.000 tokens

---

## Prompt Engineering

### Prompt base (full context)

```
Você é um assistente de estudos especializado. Sua função é ajudar o aluno a entender o conteúdo de uma aula.

REGRAS OBRIGATÓRIAS:
1. Responda APENAS com base na transcrição fornecida abaixo
2. Se a informação NÃO estiver na transcrição, diga explicitamente: "Esse assunto não foi abordado nesta aula"
3. Nunca invente exemplos, datas, nomes ou conceitos que não estejam na transcrição
4. Quando citar algo da transcrição, indique que é da aula: "Conforme explicado na aula..."
5. Seja didático e claro — adapte a linguagem para um estudante

TRANSCRIÇÃO DA AULA:
{transcription.text}

HISTÓRICO DA CONVERSA:
{chatHistory}

PERGUNTA DO ALUNO:
{userMessage}
```

### Prompt com chunking (transcrições longas)

```
Você é um assistente de estudos especializado. Sua função é ajudar o aluno a entender o conteúdo de uma aula.

REGRAS OBRIGATÓRIAS:
1. Responda APENAS com base nos trechos da transcrição fornecidos abaixo
2. Se a informação não estiver nos trechos, diga: "Esse assunto pode não ter sido abordado nesta aula, ou está em um trecho não selecionado"
3. Nunca invente conteúdo

TRECHOS RELEVANTES DA TRANSCRIÇÃO:
{selectedChunks}

HISTÓRICO DA CONVERSA:
{chatHistory}

PERGUNTA DO ALUNO:
{userMessage}
```

---

## Algoritmo TF-IDF para Seleção de Chunks

Quando a transcrição ultrapassa 50k tokens, o texto é dividido em chunks e apenas os mais relevantes para a pergunta são incluídos no prompt.

### Parâmetros

- **Chunk size:** 500 tokens (~380 palavras)
- **Overlap:** 50 tokens (~38 palavras) — evita cortar conceitos no meio
- **Top N chunks:** 8 chunks (≈ 4.000 tokens de contexto)

### Algoritmo simplificado

```typescript
// 1. Dividir transcrição em chunks com overlap
function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {}

// 2. Calcular TF-IDF entre a pergunta e cada chunk
function computeTfIdf(query: string, chunks: string[]): number[] {}

// 3. Retornar os top N chunks ordenados por score
function selectTopChunks(query: string, chunks: string[], topN = 8): string[] {}
```

A implementação usa apenas a biblioteca nativa do Node.js — sem dependências externas.

---

## Backend — Estrutura de Módulos

```
backend/src/modules/chat/
  domain/
    entities/
      chat-message.entity.ts        # Entidade pura (id, transcriptionId, userId, role, content, createdAt)
    repositories/
      chat.repository.ts            # Interface IChatRepository
    use-cases/
      send-message.use-case.ts      # Orquestra: busca transcrição → monta prompt → chama provider → salva
      get-chat-history.use-case.ts  # Retorna histórico de mensagens de uma transcrição
  infrastructure/
    repositories/
      chat.repository.impl.ts       # Implementação Supabase (chat_messages)
    providers/
      groq-chat.provider.impl.ts    # Chama Groq API com streaming
    helpers/
      tfidf.helper.ts               # Algoritmo TF-IDF para chunking
      token-estimator.helper.ts     # Estima tokens de um texto (heurística 1.3 tokens/word)
  application/
    dto/
      send-message.dto.ts           # { message: string }
      chat-message-response.dto.ts  # { id, role, content, createdAt }
    services/
      chat.service.ts               # Orquestra use-cases, decide full context vs chunking
  presentation/
    controllers/
      chat.controller.ts            # POST /chat/:transcriptionId (SSE)
  chat.module.ts
```

---

## Entidade de Domínio

```typescript
// chat-message.entity.ts
export class ChatMessageEntity {
  constructor(
    readonly id: string,
    readonly transcriptionId: string,
    readonly userId: string,
    readonly role: 'user' | 'assistant',
    readonly content: string,
    readonly createdAt: Date,
  ) {}

  static create(params: {
    transcriptionId: string;
    userId: string;
    role: 'user' | 'assistant';
    content: string;
  }): ChatMessageEntity {
    return new ChatMessageEntity(
      crypto.randomUUID(),
      params.transcriptionId,
      params.userId,
      params.role,
      params.content,
      new Date(),
    );
  }
}
```

---

## Interface do Repositório

```typescript
// chat.repository.ts
export interface IChatRepository {
  saveMessage(message: ChatMessageEntity): Promise<void>;
  getHistory(transcriptionId: string, userId: string, limit?: number): Promise<ChatMessageEntity[]>;
  clearHistory(transcriptionId: string, userId: string): Promise<void>;
}
```

---

## Interface do Provider

```typescript
// chat.provider.ts
export interface IChatProvider {
  streamResponse(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string,
  ): AsyncIterable<string>; // tokens streamados
}
```

---

## Implementação do Provider (Groq Streaming)

```typescript
// groq-chat.provider.impl.ts
@Injectable()
export class GroqChatProvider implements IChatProvider {
  async *streamResponse(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string,
  ): AsyncIterable<string> {
    const stream = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10), // últimas 10 mensagens para não explodir o context
        { role: 'user', content: userMessage },
      ],
      stream: true,
      temperature: 0.3, // baixo para respostas mais factuais
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) yield token;
    }
  }
}
```

---

## Use Case Principal

```typescript
// send-message.use-case.ts
@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly transcriptionRepository: ITranscriptionRepository,
    private readonly chatProvider: IChatProvider,
    private readonly tokenEstimator: TokenEstimatorHelper,
    private readonly tfidf: TfIdfHelper,
  ) {}

  async *execute(params: {
    transcriptionId: string;
    userId: string;
    userMessage: string;
  }): AsyncIterable<string> {
    // 1. Buscar transcrição (valida que pertence ao userId via RLS)
    const transcription = await this.transcriptionRepository.findById(
      params.transcriptionId,
      params.userId,
    );
    if (!transcription) throw new NotFoundException('Transcrição não encontrada');
    if (transcription.status !== 'COMPLETED') throw new BadRequestException('Transcrição ainda não concluída');

    // 2. Buscar histórico (últimas 10 mensagens)
    const history = await this.chatRepository.getHistory(
      params.transcriptionId,
      params.userId,
      10,
    );

    // 3. Decidir estratégia (full context vs chunking)
    const estimatedTokens = this.tokenEstimator.estimate(transcription.transcriptionText);
    let contextText: string;

    if (estimatedTokens <= 50_000) {
      contextText = transcription.transcriptionText;
    } else {
      const chunks = this.tfidf.selectTopChunks(params.userMessage, transcription.transcriptionText);
      contextText = chunks.join('\n\n---\n\n');
    }

    // 4. Montar prompt
    const systemPrompt = buildSystemPrompt(contextText);

    // 5. Salvar mensagem do usuário
    const userMsgEntity = ChatMessageEntity.create({
      transcriptionId: params.transcriptionId,
      userId: params.userId,
      role: 'user',
      content: params.userMessage,
    });
    await this.chatRepository.saveMessage(userMsgEntity);

    // 6. Stremar resposta e acumular para salvar
    let fullResponse = '';
    for await (const token of this.chatProvider.streamResponse(systemPrompt, history, params.userMessage)) {
      fullResponse += token;
      yield token;
    }

    // 7. Salvar resposta do assistente
    const assistantMsgEntity = ChatMessageEntity.create({
      transcriptionId: params.transcriptionId,
      userId: params.userId,
      role: 'assistant',
      content: fullResponse,
    });
    await this.chatRepository.saveMessage(assistantMsgEntity);
  }
}
```

---

## Controller — SSE (Server-Sent Events)

```typescript
// chat.controller.ts
@Controller('chat')
@UseGuards(SupabaseAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':transcriptionId')
  async sendMessage(
    @Param('transcriptionId') transcriptionId: string,
    @Body() dto: SendMessageDto,
    @Request() req,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Railway/nginx: desabilita buffering

    try {
      for await (const token of this.chatService.sendMessage({
        transcriptionId,
        userId: req.user.id,
        userMessage: dto.message,
      })) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    } finally {
      res.end();
    }
  }

  @Get(':transcriptionId/history')
  async getHistory(
    @Param('transcriptionId') transcriptionId: string,
    @Request() req,
  ): Promise<ChatMessageResponseDto[]> {
    return this.chatService.getHistory(transcriptionId, req.user.id);
  }

  @Delete(':transcriptionId/history')
  async clearHistory(
    @Param('transcriptionId') transcriptionId: string,
    @Request() req,
  ): Promise<void> {
    return this.chatService.clearHistory(transcriptionId, req.user.id);
  }
}
```

### Endpoints expostos

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/v1/chat/:transcriptionId` | Envia mensagem, resposta via SSE |
| `GET` | `/api/v1/chat/:transcriptionId/history` | Retorna histórico da conversa |
| `DELETE` | `/api/v1/chat/:transcriptionId/history` | Limpa histórico |

---

## Banco de Dados

### Migration

```sql
-- supabase/migrations/20260322000000_chat_messages.sql

CREATE TABLE chat_messages (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID      NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role           TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content        TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS obrigatório
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "users_select_own_chat_messages"
ON chat_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_chat_messages"
ON chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_chat_messages"
ON chat_messages FOR DELETE
USING (auth.uid() = user_id);

-- Índices para RLS e queries de histórico
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_transcription_id ON chat_messages(transcription_id);
CREATE INDEX idx_chat_messages_transcription_user ON chat_messages(transcription_id, user_id, created_at DESC);
```

---

## Frontend — Estrutura FSD

```
frontend/src/
  pages/
    ChatPage/
      ui/ChatPage.tsx               # Rota /transcription/:id/chat
      index.ts

  widgets/
    ChatPanel/
      ui/
        ChatMessage.tsx             # Bolha de mensagem (user/assistant) com Markdown
        ChatInput.tsx               # Input + botão enviar + estado loading
        ChatHistory.tsx             # Lista de mensagens com scroll automático
        TypingIndicator.tsx         # Animação "digitando..." enquanto streama
      model/
        useChatStream.ts            # EventSource + acumulação de tokens
        useChatHistory.ts           # TanStack Query para buscar histórico
      index.ts
```

### Hook — `useChatStream.ts`

```typescript
export function useChatStream(transcriptionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const sendMessage = useCallback(async (userMessage: string) => {
    // 1. Adicionar mensagem do usuário imediatamente
    setMessages(prev => [...prev, { role: 'user', content: userMessage, id: crypto.randomUUID() }]);
    setIsStreaming(true);
    setStreamingContent('');

    // 2. Abrir SSE com fetch (EventSource não suporta POST)
    const response = await axiosInstance.post(
      `/chat/${transcriptionId}`,
      { message: userMessage },
      { responseType: 'stream', adapter: 'fetch' }
    );

    const reader = response.data.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    // 3. Ler tokens
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const data = JSON.parse(line.slice(6));
        if (data.done) break;
        if (data.error) throw new Error(data.error);
        if (data.token) {
          accumulated += data.token;
          setStreamingContent(accumulated);
        }
      }
    }

    // 4. Finalizar — mover streamingContent para messages
    setMessages(prev => [...prev, { role: 'assistant', content: accumulated, id: crypto.randomUUID() }]);
    setStreamingContent('');
    setIsStreaming(false);
  }, [transcriptionId]);

  return { messages, isStreaming, streamingContent, sendMessage };
}
```

### Componente — `ChatMessage.tsx`

```tsx
interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`
        max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${role === 'user'
          ? 'bg-[var(--accent)] text-white rounded-tr-sm'
          : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-tl-sm border border-[var(--border)]'
        }
      `}>
        {role === 'assistant' ? (
          <MarkdownRenderer content={content} />
        ) : (
          <p>{content}</p>
        )}
        {isStreaming && <span className="inline-block w-1 h-4 bg-current animate-pulse ml-1" />}
      </div>
    </div>
  );
}
```

### Página — `ChatPage.tsx`

```tsx
export function ChatPage() {
  const { id: transcriptionId } = useParams();
  const { messages, isStreaming, streamingContent, sendMessage } = useChatStream(transcriptionId!);
  const { data: history } = useChatHistory(transcriptionId!);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)]">
        <Link to={`/transcription/${transcriptionId}`}>
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <h1 className="text-[var(--text-primary)] font-semibold">Chat com a Aula</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Histórico salvo */}
        {history?.map(msg => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {/* Mensagens da sessão atual */}
        {messages.map(msg => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {/* Token em streaming */}
        {isStreaming && streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} isStreaming />
        )}
        {isStreaming && !streamingContent && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
```

---

## Navegação — Integrar ao `TranscriptionPage`

Adicionar botão "Chat com a Aula" na `TranscriptionPage`, ao lado das tabs:

```tsx
// Em TranscriptionPage, ao lado das tabs
<Link to={`/transcription/${id}/chat`}>
  <Button variant="secondary" size="sm">
    <MessageSquare className="w-4 h-4 mr-2" />
    Chat com a Aula
  </Button>
</Link>
```

Adicionar rota no router:

```tsx
// app/router.tsx
<Route path="/transcription/:id/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
```

---

## Rate Limiting

O chat usa o Groq Llama 3.3 70B no mesmo token que o resumo e study materials. Para evitar conflito:

- Rate limit no endpoint: **20 mensagens/minuto por usuário** (via `@nestjs/throttler`)
- Histórico limitado a **10 mensagens** por chamada ao provider (não deixa o context crescer indefinidamente)
- Transcrições > 100k tokens: log de aviso + fallback para chunking obrigatório

```typescript
// No chat.controller.ts
@Throttle({ default: { limit: 20, ttl: 60_000 } })
@Post(':transcriptionId')
async sendMessage() {}
```

---

## Testes

### Backend — `send-message.use-case.spec.ts`

```typescript
describe('SendMessageUseCase', () => {
  describe('execute', () => {
    it('deve lançar NotFoundException se a transcrição não existir');
    it('deve lançar BadRequestException se a transcrição não estiver COMPLETED');
    it('deve usar full context quando transcrição < 50k tokens');
    it('deve usar chunking TF-IDF quando transcrição > 50k tokens');
    it('deve salvar mensagem do usuário antes de chamar o provider');
    it('deve salvar resposta do assistente após streaming completo');
    it('deve passar o histórico (máx 10 msgs) para o provider');
  });
});

describe('TfIdfHelper', () => {
  it('deve retornar os chunks mais relevantes para a query');
  it('deve respeitar o overlap entre chunks');
  it('deve retornar no máximo topN chunks');
});
```

### Frontend — `useChatStream.spec.ts`

```typescript
describe('useChatStream', () => {
  it('deve adicionar mensagem do usuário imediatamente');
  it('deve acumular tokens no streamingContent durante streaming');
  it('deve mover streamingContent para messages ao finalizar');
  it('deve definir isStreaming=false após concluir');
});
```

---

## Checklist de Implementação

### Backend
- [ ] Migration `20260322000000_chat_messages.sql` (tabela + RLS + índices)
- [ ] `ChatMessageEntity` + `IChatRepository`
- [ ] `ChatRepositoryImpl` (Supabase)
- [ ] `TokenEstimatorHelper` (heurística 1.3 tokens/palavra)
- [ ] `TfIdfHelper` (chunking + seleção)
- [ ] `IChatProvider` + `GroqChatProviderImpl` (streaming)
- [ ] `SendMessageUseCase` + `GetChatHistoryUseCase`
- [ ] `ChatService` (orquestra use-cases)
- [ ] `ChatController` (SSE + history + clear)
- [ ] `ChatModule` + registrar em `AppModule`
- [ ] Testes unitários (use-cases, helpers, controller)

### Frontend
- [ ] `useChatStream.ts` (fetch + stream reader)
- [ ] `useChatHistory.ts` (TanStack Query GET history)
- [ ] `ChatMessage.tsx` (bolhas user/assistant + Markdown)
- [ ] `ChatInput.tsx` (input + enviar)
- [ ] `TypingIndicator.tsx` (animação loading)
- [ ] `ChatHistory.tsx` (lista + auto-scroll)
- [ ] `ChatPage.tsx` (composição)
- [ ] Rota `/transcription/:id/chat` no router
- [ ] Botão "Chat com a Aula" na `TranscriptionPage`
- [ ] Testes do hook `useChatStream`

---

## Decisões de Design

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Protocolo de streaming | SSE (Server-Sent Events) | Mais simples que WebSocket para streaming unidirecional; funciona com proxies HTTP |
| Vector DB | Não usar | Custo zero e latência menor para transcrições < 100k tokens; 99% dos casos são cobertos por full context |
| Histórico | Persistido no Supabase | Usuário pode retomar conversa em sessões diferentes |
| Histórico no prompt | Últimas 10 mensagens | Evita context overflow; conversas de chat raramente precisam de contexto maior |
| Temperature | 0.3 | Respostas mais factuais e aderentes à transcrição, menos "criativas" |
| Modelo | Llama 3.3 70B | Já usado no projeto, alta qualidade, 128k context window |
