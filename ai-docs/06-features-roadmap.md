# anotEX.ai — Features Roadmap

> Documento técnico de features planejadas. Ordenadas por prioridade de implementação.

---

## Tier 1 — Quick wins (backend já suporta ou esforço baixo)

---

### 1. Quiz Interativo

**O que é:** Tela de quiz com perguntas de múltipla escolha geradas pela IA a partir da transcrição. O aluno responde, recebe feedback imediato (certo/errado + explicação) e uma pontuação final.

**Estado atual:** O backend já gera o quiz no `study-materials-queue.processor.ts` e salva na tabela `study_materials` com `type = 'quiz'`. **Só falta a UI.**

**Implementação frontend:**

```
pages/
  quiz/
    QuizPage.tsx          ← rota /transcription/:id/quiz

features/
  quiz/
    take-quiz/
      ui/QuizCard.tsx     ← pergunta + 4 opções (radio buttons)
      ui/QuizResult.tsx   ← tela final: X/Y acertos, breakdown por pergunta
      model/useQuizState.ts ← estado: currentQuestion, answers[], score
```

**Fluxo:**
1. `GET /api/v1/study-materials/:transcriptionId` com `type=quiz`
2. Renderizar `QuizCard` com a pergunta atual e opções embaralhadas
3. Ao responder, destacar certa (verde) e errada selecionada (vermelho) + mostrar `explanation`
4. Botão "Próxima" avança. No final, `QuizResult` com score e opção de refazer

**Tipo do dado já gerado:**
```typescript
interface QuizItem {
  question: string
  options: string[]        // 4 opções
  correctAnswer: string
  explanation: string
}
```

**Esforço estimado:** 1 dia (UI pura, sem backend)

---

### 2. Timestamps Clicáveis na Transcrição

**O que é:** Cada parágrafo ou trecho da transcrição exibe o timestamp do áudio correspondente. Clicar no timestamp posiciona o player de áudio naquele momento exato.

**Estado atual:** A transcrição é salva como texto corrido. O Groq Whisper Large v3 suporta `timestamp_granularities: ['segment']` na API — retorna um array de segmentos com `start`, `end` e `text`.

**Mudanças no backend:**

```typescript
// groq-whisper.provider.impl.ts
const transcription = await groq.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-large-v3',
  response_format: 'verbose_json',          // ← mudar de 'text' para 'verbose_json'
  timestamp_granularities: ['segment'],
})

// Retorno
interface WhisperSegment {
  id: number
  start: number   // segundos
  end: number
  text: string
}
```

**Mudanças no banco:**
```sql
-- Adicionar coluna na tabela transcriptions
ALTER TABLE transcriptions ADD COLUMN segments JSONB;
-- Ex: [{ "start": 0, "end": 4.2, "text": "Bom dia turma..." }, ...]
```

**Frontend — TranscriptionPage:**
```tsx
// Renderizar cada segmento como bloco clicável
function SegmentBlock({ segment, onSeek }: { segment: Segment, onSeek: (t: number) => void }) {
  return (
    <div onClick={() => onSeek(segment.start)} className="group cursor-pointer ...">
      <span className="text-xs font-mono text-[var(--accent)] opacity-0 group-hover:opacity-100">
        {formatTime(segment.start)}
      </span>
      <p>{segment.text}</p>
    </div>
  )
}
```

Player de áudio: `<audio>` element com `ref`, chamar `audioRef.current.currentTime = t`.

**Esforço estimado:** 2 dias (backend + migração + frontend)

---

### 3. Exportar Conteúdo

**O que é:** Botão de export na `TranscriptionPage` com opções: PDF do resumo, `.txt` da transcrição completa, `.apkg` dos flashcards (formato Anki).

**PDF do resumo:**
- Lib: `@react-pdf/renderer` (client-side, sem servidor)
- Montar um `<Document>` com título, data, resumo em Markdown renderizado

```tsx
// features/export/export-pdf/model/useExportPDF.ts
import { pdf } from '@react-pdf/renderer'
import { SummaryDocument } from '../ui/SummaryDocument'

export function useExportPDF() {
  return async (transcription: Transcription) => {
    const blob = await pdf(<SummaryDocument data={transcription} />).toBlob()
    downloadBlob(blob, `${transcription.title}.pdf`)
  }
}
```

**TXT da transcrição:**
```typescript
const blob = new Blob([transcription.text], { type: 'text/plain' })
downloadBlob(blob, `${transcription.title}-transcricao.txt`)
```

**Anki `.apkg`:**
- Formato `.apkg` é um SQLite zipado. Lib: `anki-apkg-export` (npm)
- Cada `FlashcardItem` vira um note com `front` e `back`

```typescript
import AnkiExport from 'anki-apkg-export'

export async function exportToAnki(flashcards: FlashcardItem[], deckName: string) {
  const apkg = new AnkiExport(deckName)
  flashcards.forEach(({ front, back }) => apkg.addCard(front, back))
  const blob = await apkg.save()
  downloadBlob(blob, `${deckName}.apkg`)
}
```

**UI:** Dropdown button com as 3 opções na `TranscriptionPage` (ícone `Download` Lucide).

**Esforço estimado:** 2-3 dias

---

## Tier 2 — Features de alto valor (esforço médio)

---

### 4. Chat com a Aula (RAG)

**O que é:** Interface de chat onde o aluno faz perguntas sobre o conteúdo da aula. A IA responde com base exclusivamente na transcrição, sem alucinar conteúdo externo.

**Arquitetura — RAG simples (sem vector DB):**

Para transcrições de até ~100k tokens (a maioria das aulas), dá pra usar **full context window** do Llama 3.3 70B (128k tokens) — mais simples e sem custo de embeddings.

```
Prompt:
"Você é um assistente de estudos. Responda APENAS com base na transcrição abaixo.
Se a informação não estiver na transcrição, diga que não foi abordado na aula.

TRANSCRIÇÃO:
{transcription.text}

PERGUNTA DO ALUNO:
{userMessage}"
```

Para transcrições longas (> 50k tokens), usar chunking + similaridade por TF-IDF simples antes de montar o prompt.

**Backend:**

```
modules/
  chat/
    domain/
      entities/chat-message.entity.ts
      repositories/chat.repository.ts
      use-cases/send-message.use-case.ts
    infrastructure/
      repositories/chat.repository.impl.ts
      providers/groq-chat.provider.impl.ts
    presentation/
      controllers/chat.controller.ts
      gateways/chat.gateway.ts   ← WebSocket para streaming da resposta
```

**Endpoint:**
```
POST /api/v1/chat/:transcriptionId
Body: { message: string }
Response: SSE (Server-Sent Events) com streaming da resposta token a token
```

**Frontend:**
```
pages/
  ChatPage.tsx    ← rota /transcription/:id/chat

widgets/
  ChatPanel/
    ui/ChatMessage.tsx      ← bolha de mensagem com Markdown
    ui/ChatInput.tsx        ← input + botão enviar
    model/useChatStream.ts  ← EventSource para SSE, acumula tokens
```

**Banco:**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
```

**Esforço estimado:** 3-4 dias

---

### 5. Revisão Espaçada dos Flashcards (SM-2)

**O que é:** Sistema de repetição espaçada baseado no algoritmo SM-2 (mesmo do Anki). Após revisar um flashcard, o aluno marca como "Fácil", "Médio" ou "Difícil". O sistema agenda a próxima revisão automaticamente — cards difíceis aparecem mais cedo, fáceis aparecem daqui a dias/semanas.

**Algoritmo SM-2 simplificado:**
```typescript
interface CardReview {
  interval: number       // dias até próxima revisão
  repetitions: number   // quantas vezes acertou consecutivamente
  easeFactor: number    // multiplicador (começa em 2.5)
}

function calculateNextReview(card: CardReview, quality: 0 | 1 | 2 | 3 | 4 | 5): CardReview {
  // quality: 0-2 = errou (difícil), 3-5 = acertou (médio/fácil)
  if (quality < 3) {
    return { ...card, interval: 1, repetitions: 0 }
  }

  const newEase = Math.max(1.3, card.easeFactor + 0.1 - (5 - quality) * 0.18)
  const newInterval = card.repetitions === 0 ? 1
    : card.repetitions === 1 ? 6
    : Math.round(card.interval * newEase)

  return {
    interval: newInterval,
    repetitions: card.repetitions + 1,
    easeFactor: newEase,
  }
}
```

**Banco:**
```sql
ALTER TABLE study_materials ADD COLUMN review_data JSONB;
-- Ex por flashcard: { "nextReview": "2026-03-25", "interval": 7, "repetitions": 2, "easeFactor": 2.5 }

CREATE TABLE flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  flashcard_id TEXT NOT NULL,   -- ID do item dentro do JSONB
  quality SMALLINT NOT NULL,    -- 0-5
  reviewed_at TIMESTAMPTZ DEFAULT now()
);
```

**Frontend:**
```
pages/
  ReviewPage.tsx   ← rota /review (mostra cards com nextReview <= hoje)

features/
  flashcards/
    review-flashcard/
      model/useSpacedRepetition.ts   ← calcula próxima revisão, salva no backend
      ui/ReviewCard.tsx              ← flip animation + botões Difícil/Médio/Fácil
```

**Dashboard widget:** "X cards para revisar hoje" com botão de ação direta.

**Esforço estimado:** 3-4 dias

---

### 6. Busca Semântica

**O que é:** Campo de busca no dashboard que encontra aulas por significado, não só por palavra exata. "termodinâmica" encontra aulas que falam de "calor", "entropia", "temperatura" mesmo sem a palavra aparecer.

**Abordagem recomendada — Supabase pgvector (gratuito no tier free):**

```sql
-- Habilitar extensão
CREATE EXTENSION IF NOT EXISTS vector;

-- Adicionar coluna de embedding na tabela transcriptions
ALTER TABLE transcriptions ADD COLUMN embedding vector(1536);

-- Índice para busca por similaridade
CREATE INDEX ON transcriptions
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Geração de embeddings — Groq não tem, usar alternativa gratuita:**
- **Opção A:** `nomic-embed-text` via Ollama (self-hosted) — gratuito
- **Opção B:** Hugging Face Inference API (gratuito com limites) — `sentence-transformers/all-MiniLM-L6-v2`
- **Opção C:** Cloudflare Workers AI — `@cf/baai/bge-base-en-v1.5` (gratuito no tier)

**Backend:**
```typescript
// transcription-queue.processor.ts — após salvar transcrição:
const embedding = await embeddingProvider.embed(transcription.summary ?? transcription.text)
await transcriptionRepo.saveEmbedding(transcriptionId, embedding)

// search use-case:
// SELECT id, title, similarity(embedding, $query_embedding) AS score
// FROM transcriptions
// WHERE user_id = $userId
// ORDER BY embedding <=> $query_embedding
// LIMIT 10
```

**Esforço estimado:** 3-5 dias (depende do provider de embedding escolhido)

---

## Tier 3 — Features de produto (esforço alto, diferenciação forte)

---

### 7. Detecção Automática de Matéria

**O que é:** A IA classifica automaticamente cada aula em uma matéria e sub-tópico ao final da transcrição. Ex: "Cálculo > Derivadas", "Biologia > Genética Mendeliana".

**Implementação:**
Adicionar um passo extra no `transcription-queue.processor.ts` após gerar o resumo:

```typescript
// Prompt de classificação
const prompt = `
Analise o resumo abaixo e classifique em:
- subject: a matéria principal (ex: "Matemática", "Biologia", "História")
- topic: o tópico específico (ex: "Derivadas", "Mitose", "Primeira Guerra Mundial")

Retorne APENAS JSON: { "subject": "...", "topic": "..." }

RESUMO: ${summary}
`

const classification = await llamaProvider.classify(prompt)
// Salvar em audios.subject e audios.topic
```

**Banco:**
```sql
ALTER TABLE audios ADD COLUMN subject TEXT;
ALTER TABLE audios ADD COLUMN topic TEXT;
```

**UI:** Sidebar com agrupamento por matéria. Filtro no dashboard por subject/topic. Breadcrumb na TranscriptionPage: `Matemática > Derivadas`.

**Esforço estimado:** 2 dias (lógica simples, impacto visual grande)

---

### 8. Import de PDF/Slides

**O que é:** Upload de PDF do slide da aula (ou documento de texto). A IA cruza o conteúdo dos slides com a transcrição do áudio para gerar um resumo mais rico e contextualizado.

**Fluxo:**
1. Aluno faz upload do PDF junto com a gravação (ou depois)
2. Backend extrai texto do PDF (`pdf-parse` ou `pdfjs-dist`)
3. No processamento: prompt combinado — `"Transcrição: [...] | Slides: [...]"` → resumo integrado

**Backend:**
```typescript
// Novo endpoint
POST /api/v1/audio/:id/attach-pdf
Body: multipart/form-data { pdf: File }

// Parser
import pdfParse from 'pdf-parse'
const data = await pdfParse(pdfBuffer)
const slideText = data.text  // texto extraído

// Salvar no storage R2 e referência na tabela audios
ALTER TABLE audios ADD COLUMN slide_pdf_key TEXT;
ALTER TABLE audios ADD COLUMN slide_text TEXT;
```

**Prompt melhorado:**
```
Você tem acesso à transcrição de uma aula e ao conteúdo dos slides usados.
Use AMBOS para gerar um resumo completo e estruturado.
Priorize o que foi explicado verbalmente mas use os slides para estruturar os tópicos.

SLIDES:
{slideText}

TRANSCRIÇÃO:
{transcription}
```

**Esforço estimado:** 3-4 dias

---

### 9. PWA com Gravação Mobile

**O que é:** Transformar o frontend em PWA instalável no celular. O aluno instala o anotEX como app, abre na aula, toca no botão de gravação e deixa gravando no bolso.

**Mudanças técnicas:**

```
frontend/public/
  manifest.json          ← nome, ícone, theme_color, display: standalone
  sw.js                  ← service worker (cache offline)

vite.config.ts
  // Adicionar vite-plugin-pwa
  VitePWA({
    registerType: 'autoUpdate',
    manifest: { ... },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png}'],
    }
  })
```

**Considerações de gravação em background no mobile:**
- iOS Safari: `MediaRecorder` funciona mas **para quando a tela trava** — limitação do WebKit, sem solução via web
- Android Chrome: funciona em background com Wake Lock API (`navigator.wakeLock.request('screen')`)
- Solução parcial: `NoSleep.js` + instrução pro usuário não bloquear a tela no iOS

**Esforço estimado:** 2-3 dias (PWA básica) + complexidade extra no iOS

---

### 10. Feed e Colaboração em Grupos (Supabase Realtime)

**O que é:** Dentro de um grupo de estudos, os membros veem em tempo real quando alguém adiciona uma nova aula. Feed estilo "activity stream" com opção de salvar a aula na própria biblioteca.

**Banco:**
```sql
CREATE TABLE group_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,   -- 'shared_audio', 'added_note', etc.
  resource_id UUID,
  resource_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE group_activity ENABLE ROW LEVEL SECURITY;
```

**Supabase Realtime:**
```typescript
// No frontend, subscribing ao canal do grupo
const channel = supabase
  .channel(`group:${groupId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'group_activity',
    filter: `group_id=eq.${groupId}`,
  }, (payload) => {
    // Atualizar feed em tempo real
    queryClient.invalidateQueries({ queryKey: ['group-activity', groupId] })
  })
  .subscribe()
```

**"Salvar na minha biblioteca":**
```sql
-- Criar uma cópia do share_link na biblioteca do usuário
INSERT INTO user_saved_resources (user_id, share_link_id) VALUES ($uid, $slid);
```

**Esforço estimado:** 4-5 dias

---

## Resumo — Priorização

| # | Feature | Impacto | Esforço | Tier |
|---|---------|---------|---------|------|
| 1 | Quiz Interativo | Alto | Baixo (1d) | Quick win |
| 2 | Timestamps clicáveis | Médio | Baixo (2d) | Quick win |
| 3 | Exportar (PDF/TXT/Anki) | Alto | Médio (3d) | Quick win |
| 4 | Chat com a aula (RAG) | Muito alto | Médio (4d) | Tier 2 |
| 5 | Revisão espaçada SM-2 | Muito alto | Médio (4d) | Tier 2 |
| 6 | Busca semântica | Alto | Médio (5d) | Tier 2 |
| 7 | Detecção de matéria | Médio | Baixo (2d) | Tier 3 |
| 8 | Import de PDF/Slides | Alto | Médio (4d) | Tier 3 |
| 9 | PWA Mobile | Alto | Médio (3d) | Tier 3 |
| 10 | Feed de grupos (Realtime) | Médio | Alto (5d) | Tier 3 |
