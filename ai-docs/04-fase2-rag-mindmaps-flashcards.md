# anotEX.ai — Fase 2: RAG, Mapas Mentais e Flashcards

## Índice

1. [Visão Geral](#1-visão-geral)
2. [O que cada feature faz](#2-o-que-cada-feature-faz)
3. [Sequência de implementação](#3-sequência-de-implementação)
4. [Arquitetura — Backend](#4-arquitetura--backend)
5. [Banco de Dados — Novas tabelas](#5-banco-de-dados--novas-tabelas)
6. [Providers de IA — Escolhas e Justificativas](#6-providers-de-ia--escolhas-e-justificativas)
7. [Como funciona o RAG (passo a passo)](#7-como-funciona-o-rag-passo-a-passo)
8. [Como funciona o Mapa Mental](#8-como-funciona-o-mapa-mental)
9. [Como funcionam os Flashcards e Quiz](#9-como-funcionam-os-flashcards-e-quiz)
10. [Análise de Custos](#10-análise-de-custos)
11. [Frontend — Mudanças](#11-frontend--mudanças)
12. [Riscos e Mitigações](#12-riscos-e-mitigações)

---

## 1. Visão Geral

A Fase 1 resolve o problema básico: gravar → transcrever → resumir.

A Fase 2 transforma a transcrição em um **sistema completo de estudo**:

| Feature | O que faz | Complexidade |
|---------|-----------|--------------|
| **Mapas Mentais** | LLM extrai hierarquia de tópicos da aula | Baixa |
| **Flashcards** | LLM gera cartões frente/verso por tópico | Baixa |
| **Quiz automático** | LLM gera questões de múltipla escolha | Baixa |
| **RAG (Q&A)** | Usuário pergunta sobre a aula, IA busca a resposta no conteúdo | Alta |

A ordem de implementação importa: Mapas + Flashcards são só LLM. RAG exige embeddings + vector DB — infraestrutura nova.

---

## 2. O que cada feature faz

### Mapa Mental
Dado o resumo da aula, o LLM gera uma estrutura hierárquica de tópicos em formato Markmap (markdown com níveis `#`, `##`, `###`). O frontend renderiza como mapa mental interativo.

```
# Redes de Computadores
## Modelo OSI
### Camada Física
### Camada de Enlace
### Camada de Rede
## Protocolo TCP/IP
### IPv4 vs IPv6
### Roteamento
## Segurança
### Firewall
### VPN
```

### Flashcards
LLM gera 15-25 cartões frente/verso com dificuldade e tópico. Gerados a partir do resumo, não da transcrição inteira (mais rápido, mais objetivo).

```json
[
  {
    "front": "O que é o Modelo OSI?",
    "back": "Modelo de referência de 7 camadas para comunicação em redes...",
    "difficulty": "easy",
    "topic": "Modelo OSI"
  }
]
```

### Quiz
Extensão dos flashcards: questões de múltipla escolha com 4 opções e explicação da resposta correta.

```json
[
  {
    "question": "Qual camada do Modelo OSI é responsável pelo roteamento?",
    "options": ["Enlace", "Rede", "Transporte", "Sessão"],
    "correct": 1,
    "explanation": "A camada de Rede (Layer 3) lida com endereçamento lógico e roteamento..."
  }
]
```

### RAG (Retrieval-Augmented Generation)
Permite que o usuário faça perguntas sobre o conteúdo da aula. O sistema busca os trechos relevantes da transcrição e usa o LLM para responder com base neles — não alucina, cita a fonte.

```
Usuário: "O professor falou sobre diferença de TCP e UDP?"

Sistema:
  1. Embeds a pergunta → vetor numérico
  2. Busca os 5 trechos mais similares da transcrição (pgvector)
  3. Passa trechos + pergunta para o LLM
  4. LLM responde baseado APENAS no conteúdo da aula

Resposta: "Sim, na parte sobre protocolos de transporte o professor explicou que..."
```

---

## 3. Sequência de implementação

```
Fase 2a — Materiais de estudo (sem vector DB)
  ├── study_materials table no banco
  ├── Backend: study-materials module
  │   ├── GenerateStudyMaterialsUseCase
  │   ├── BullMQ job: generate após COMPLETED
  │   └── GroqStudyMaterialProviderImpl
  ├── Frontend: tabs na TranscriptionPage
  │   ├── MindMapViewer (markmap)
  │   └── FlashcardDeck
  └── Duração estimada: 1-2 semanas

Fase 2b — RAG (vector DB + embeddings)
  ├── pgvector habilitado no Supabase (1 clique no dashboard)
  ├── transcription_chunks table + HNSW index
  ├── Backend: rag module
  │   ├── IndexTranscriptionUseCase (chunking + embeddings)
  │   ├── AskQuestionUseCase (embed + search + LLM)
  │   ├── VoyageEmbeddingProviderImpl
  │   └── BullMQ job: index após COMPLETED
  ├── Frontend: RagChat widget na TranscriptionPage
  └── Duração estimada: 2-3 semanas

Fase 2c — Quiz
  ├── Extensão do study-materials module (tipo 'quiz')
  ├── Frontend: QuizView com pontuação
  └── Duração estimada: 3-5 dias
```

---

## 4. Arquitetura — Backend

### Estrutura de módulos novos

```
src/
  modules/
    study-materials/                        ← Fase 2a
      domain/
        entities/
          study-material.entity.ts
        repositories/
          study-material.repository.ts      (interface)
          study-material.provider.ts        (IStudyMaterialProvider)
        use-cases/
          generate-study-materials.use-case.ts
          get-study-materials.use-case.ts
      infrastructure/
        repositories/
          study-material.repository.impl.ts (Supabase)
        providers/
          groq-study-material.provider.impl.ts
      application/
        dto/
          study-material-response.dto.ts
        services/
          study-material-queue.processor.ts (BullMQ)
      presentation/
        controllers/
          study-material.controller.ts
      study-material.module.ts

    rag/                                    ← Fase 2b
      domain/
        entities/
          chunk.entity.ts
        repositories/
          chunk.repository.ts               (interface com vector search)
          embedding.provider.ts             (IEmbeddingProvider)
        use-cases/
          index-transcription.use-case.ts
          ask-question.use-case.ts
      infrastructure/
        repositories/
          chunk.repository.impl.ts          (pgvector via Supabase)
        providers/
          voyage-embedding.provider.impl.ts (primário)
          cloudflare-embedding.provider.impl.ts (fallback)
      application/
        services/
          rag-queue.processor.ts            (BullMQ: indexar após COMPLETED)
      presentation/
        controllers/
          rag.controller.ts
      rag.module.ts
```

### Interfaces de domínio novas

```typescript
// study-material.entity.ts
export type StudyMaterialType = 'flashcards' | 'mindmap' | 'quiz';
export type StudyMaterialStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface StudyMaterialEntity {
  readonly id: string;
  readonly transcriptionId: string;
  readonly userId: string;
  readonly type: StudyMaterialType;
  readonly status: StudyMaterialStatus;
  readonly content: FlashcardContent[] | MindmapContent | QuizContent | null;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface FlashcardContent {
  readonly front: string;
  readonly back: string;
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly topic: string;
}

export interface MindmapContent {
  readonly markdown: string; // formato markmap
}

export interface QuizContent {
  readonly question: string;
  readonly options: readonly string[];
  readonly correct: number;
  readonly explanation: string;
}

// chunk.entity.ts
export interface ChunkEntity {
  readonly id: string;
  readonly transcriptionId: string;
  readonly userId: string;
  readonly content: string;
  readonly chunkIndex: number;
  readonly tokenCount: number;
  readonly createdAt: Date;
}

// embedding.provider.ts
export interface IEmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export const EMBEDDING_PROVIDER = Symbol('IEmbeddingProvider');
```

### BullMQ — fluxo após transcrição COMPLETED

Quando `ProcessTranscriptionUseCase` conclui, o `TranscriptionQueueProcessor` dispara dois jobs adicionais:

```typescript
// Após salvar COMPLETED:
await studyMaterialQueue.add('generate', { transcriptionId, userId });
await ragQueue.add('index', { transcriptionId, audioId, userId });
```

Os dois jobs rodam em paralelo — são independentes.

---

## 5. Banco de Dados — Novas tabelas

### Habilitar pgvector no Supabase

No dashboard do Supabase → Database → Extensions → habilitar `vector`. Gratuito, já incluído.

### DDL completo

```sql
-- =============================================================================
-- Habilitar extensão (uma vez)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS vector;


-- =============================================================================
-- Materiais de estudo (flashcards, mindmap, quiz)
-- =============================================================================
CREATE TABLE study_materials (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID       NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL,
  type            TEXT        NOT NULL CHECK (type IN ('flashcards', 'mindmap', 'quiz')),
  status          TEXT        NOT NULL DEFAULT 'PENDING'
                              CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  content         JSONB,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_materials_select_own"
  ON study_materials FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "study_materials_insert_own"
  ON study_materials FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM transcriptions
      WHERE transcriptions.id = transcription_id
        AND transcriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "study_materials_update_own"
  ON study_materials FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_materials_delete_own"
  ON study_materials FOR DELETE USING (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_study_materials_transcription_id ON study_materials (transcription_id);
CREATE INDEX idx_study_materials_user_id ON study_materials (user_id);
CREATE INDEX idx_study_materials_type ON study_materials (transcription_id, type);


-- =============================================================================
-- Chunks de transcrição para RAG (com embeddings)
-- =============================================================================
-- Voyage AI voyage-3-lite = 512 dimensões
CREATE TABLE transcription_chunks (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID        NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL,
  content          TEXT        NOT NULL,
  chunk_index      INT         NOT NULL,
  token_count      INT         NOT NULL,
  embedding        vector(512),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE transcription_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chunks_select_own"
  ON transcription_chunks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chunks_insert_own"
  ON transcription_chunks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chunks_delete_own"
  ON transcription_chunks FOR DELETE USING (auth.uid() = user_id);

-- Índice HNSW para busca cosine (mais rápido que IVFFlat para nossa escala)
-- m=16: 16 conexões por nó (padrão bom), ef_construction=64: qualidade vs velocidade
CREATE INDEX idx_chunks_embedding
  ON transcription_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Índice para buscar chunks por transcrição
CREATE INDEX idx_chunks_transcription_id ON transcription_chunks (transcription_id);
CREATE INDEX idx_chunks_user_id ON transcription_chunks (user_id);


-- =============================================================================
-- Histórico de Q&A (opcional — para o usuário rever perguntas anteriores)
-- =============================================================================
CREATE TABLE rag_messages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID        NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL,
  question         TEXT        NOT NULL,
  answer           TEXT        NOT NULL,
  source_chunk_ids UUID[]      NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rag_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rag_messages_select_own"
  ON rag_messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "rag_messages_insert_own"
  ON rag_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_rag_messages_transcription_id ON rag_messages (transcription_id);
CREATE INDEX idx_rag_messages_user_id ON rag_messages (user_id);


-- =============================================================================
-- Função auxiliar para busca de similaridade (usada pelo backend)
-- Supabase não expõe funções SQL diretamente, mas o backend pode chamar via RPC
-- =============================================================================
CREATE OR REPLACE FUNCTION search_chunks(
  query_embedding vector(512),
  target_transcription_id UUID,
  match_threshold FLOAT DEFAULT 0.4,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  chunk_index INT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    chunk_index,
    1 - (embedding <=> query_embedding) AS similarity
  FROM transcription_chunks
  WHERE
    transcription_id = target_transcription_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### Por que HNSW e não IVFFlat?

| | HNSW | IVFFlat |
|---|---|---|
| Precisa treinar? | Não | Sim (`ANALYZE` + mínimo de vetores) |
| Recall | 98%+ | ~95% com configuração correta |
| Escala ideal | Até ~5M vetores | Melhor acima de 1M |
| Melhor para nós? | Sim | Não (IVFFlat precisa de dados para treinar) |

---

## 6. Providers de IA — Escolhas e Justificativas

### Embeddings

**Primário: Voyage AI `voyage-3-lite`**

| Característica | Valor |
|---|---|
| Dimensões | 512 |
| Contexto | 32.768 tokens |
| Free tier | **200M tokens/mês** |
| Preço após free | $0.02/1M tokens |
| Suporte português | Excelente (multilingual) |

200M tokens gratuitos = **~16.600 aulas de 1 hora** indexadas por mês. Extremamente generoso.

```
1 aula de 1h ≈ 12.000 tokens de transcrição
Dividido em 20 chunks de 600 tokens = 12.000 tokens de embedding
200M / 12.000 = 16.666 aulas indexadas/mês FREE
```

**Fallback: Cloudflare Workers AI `@cf/baai/bge-m3`**
- Multilingual, 1024 dims, free tier do Workers AI
- Já temos conta Cloudflare (R2)
- Usado automaticamente se Voyage retornar 429

**Por que não OpenAI `text-embedding-3-small`?**
- $0.02/1M tokens — não tem free tier generoso
- Voyage 200M gratuitos é melhor ponto de partida

**Por que não pgvector built-in do Supabase?**
- Supabase não oferece embedding — só armazena vetores. Precisamos de uma API para gerar embeddings.

### LLM para Materiais de Estudo

**Primário: Groq `llama-3.3-70b-versatile`** (já em uso)
- Flashcards: 1 chamada por geração, ~2.000 tokens input, ~1.500 output
- Mind map: 1 chamada, ~2.000 tokens input, ~500 output
- Quiz: 1 chamada, ~2.000 tokens input, ~2.000 output

**Fallback: Google Gemini Flash** (via Google AI Studio)
- 15 req/min gratuito
- Excelente para textos estruturados em JSON
- Usado quando Groq retornar 429

### LLM para RAG (Q&A)

**Primário: Groq `llama-3.3-70b-versatile`**
- Input: pergunta + 5 chunks × 600 tokens ≈ 3.200 tokens
- Output: resposta ≈ 400-800 tokens
- Latência Groq: ~1-2s (muito rápido)

### Chunking

Sem biblioteca externa. Algoritmo próprio simples:
- Tamanho alvo: **600 tokens** (~450 palavras em português)
- Overlap: **100 tokens** (~75 palavras) — preserva contexto entre chunks
- Estratégia: quebrar em parágrafos primeiro, depois em sentenças se necessário
- Estimativa de tokens: `text.split(/\s+/).length * 1.3` (português tem tokens ~30% maiores que palavras)

---

## 7. Como funciona o RAG (passo a passo)

### Fase de Indexação (roda uma vez após COMPLETED)

```
TranscriptionQueueProcessor.onCompleted
  └── ragQueue.add('index', { transcriptionId, userId })
        └── RagQueueProcessor.process
              └── IndexTranscriptionUseCase.execute
                    1. Busca transcription.transcriptionText do banco
                    2. Divide em chunks (600 tokens, 100 overlap)
                       Ex: aula 1h ≈ 12.000 tokens → ~22 chunks
                    3. Para cada chunk em batches de 10:
                       VoyageEmbeddingProvider.embedBatch(chunks)
                       → retorna array de vetores 512-dim
                    4. Salva em transcription_chunks (content + embedding)
                    5. Log: "indexed N chunks for transcription X"
```

### Fase de Consulta (por request do usuário)

```
POST /api/v1/rag/:transcriptionId/ask
  { question: "O professor falou sobre TCP?" }

AskQuestionUseCase.execute
  1. Verifica ownership da transcrição
  2. VoyageEmbeddingProvider.embed(question)
     → vetor 512-dim da pergunta
  3. chunk.repository.searchSimilar(embedding, transcriptionId, top=5, threshold=0.4)
     → pgvector: SELECT ... ORDER BY embedding <=> query LIMIT 5
     → retorna chunks com similarity score
  4. Se nenhum chunk acima do threshold → resposta: "não encontrei essa informação na aula"
  5. Monta prompt:
     SYSTEM: "Você é um assistente de estudos. Responda APENAS com base nos
              trechos da aula fornecidos. Se a informação não estiver nos trechos,
              diga que não foi abordado na aula. Responda em português."
     USER: [trecho 1] ... [trecho 5] ... Pergunta: "O professor falou sobre TCP?"
  6. Groq Llama 3.3 70B → resposta
  7. Salva em rag_messages (question + answer + chunk_ids)
  8. Retorna: { answer, sources: [{ chunkIndex, similarity, preview }] }
```

### Por que threshold 0.4?

- Cosine similarity vai de 0 a 1 (0 = perpendicular, 1 = idêntico)
- < 0.4: provavelmente não relacionado ao tema da pergunta
- 0.4-0.7: relacionado mas não específico
- > 0.7: altamente relevante
- Se nenhum chunk passar de 0.4 → LLM não tem contexto útil → melhor dizer "não sei" do que alucinar

---

## 8. Como funciona o Mapa Mental

### Por que Markmap e não JSON + D3.js?

Markmap aceita markdown simples e renderiza um mapa mental interativo. O LLM gera markdown naturalmente (hierarquia com `#`, `##`, `###`) e o markmap transforma em visualização sem precisar de schema JSON complexo.

### Pipeline

```
GenerateStudyMaterialsUseCase.execute({ transcriptionId, type: 'mindmap' })
  1. Busca transcription.summaryText (não o texto completo — mais curto, mais direto)
  2. Prompt para Groq:
     "Analise o resumo desta aula e gere um mapa mental em formato Markdown.
      Use # para o tema principal, ## para tópicos, ### para subtópicos e
      - para detalhes. Máximo 3 níveis de profundidade. Apenas o markdown, sem explicações.

      Resumo: {summaryText}"
  3. LLM retorna:
     # Redes de Computadores
     ## Modelo OSI
     ### 7 camadas
     - Aplicação, Apresentação, Sessão...
     ### Encapsulamento
     ## TCP/IP
     ...
  4. Salva em study_materials: { type: 'mindmap', content: { markdown: "..." } }
```

### Frontend — Markmap

```bash
npm install markmap-view markmap-lib
```

```tsx
// widgets/mindmap/ui/MindMapViewer.tsx
import { Markmap } from 'markmap-view'
import { Transformer } from 'markmap-lib'

export function MindMapViewer({ markdown }: { markdown: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const transformer = new Transformer()
    const { root } = transformer.transform(markdown)
    const mm = Markmap.create(svgRef.current)
    mm.setData(root)
    mm.fit()
  }, [markdown])

  return <svg ref={svgRef} className="w-full h-[500px]" />
}
```

---

## 9. Como funcionam os Flashcards e Quiz

### Flashcards

```
Prompt:
  "Crie 15 a 20 flashcards de estudo baseados neste resumo de aula.
   Retorne APENAS um JSON array com objetos no formato:
   { front, back, difficulty: 'easy'|'medium'|'hard', topic }

   Resumo: {summaryText}"

Output (validado por JSON.parse antes de salvar):
  [
    { "front": "...", "back": "...", "difficulty": "medium", "topic": "Modelo OSI" },
    ...
  ]
```

### Quiz

```
Prompt:
  "Crie 10 questões de múltipla escolha sobre esta aula.
   Retorne APENAS um JSON array:
   { question, options: [4 opções], correct: 0-3, explanation }

   Resumo: {summaryText}"
```

### Tratamento de JSON malformado

LLMs às vezes quebram o JSON. Estratégia defensiva:
1. `JSON.parse(response)` — happy path
2. Se falhar: regex para extrair o array `\[[\s\S]*\]`
3. Se ainda falhar: marcar como FAILED, retry na fila

---

## 10. Análise de Custos

### Stack Fase 2 — Custo $0 até onde?

#### Embeddings (Voyage AI)

| Cálculo | Valor |
|---|---|
| Tokens por aula de 1h | ~12.000 (20 chunks × 600t) |
| Free tier | 200M tokens/mês |
| Aulas indexadas gratuitas/mês | **~16.600** |
| Preço após free tier | $0.02/1M tokens |
| Custo por aula depois do free | $0.00024 (~$0.24/1.000 aulas) |

#### Armazenamento dos vetores (pgvector no Supabase)

| Cálculo | Valor |
|---|---|
| Tamanho por chunk | 512 dims × 4 bytes = 2KB |
| Chunks por aula | 20 |
| Armazenamento por aula | 40KB |
| Free tier Supabase | 500MB |
| Aulas até atingir o limite | **~12.500** |
| Quando pagar | Supabase Pro $25/mês → 8GB → 200.000 aulas |

#### LLM (Groq)

| Feature | Tokens por geração | Custo |
|---|---|---|
| Flashcards | ~3.500 total | $0 (free) |
| Mind map | ~2.500 total | $0 (free) |
| Quiz | ~4.000 total | $0 (free) |
| RAG Q&A | ~3.500/pergunta | $0 (free) |

Rate limit Groq: 30 req/min → com fila BullMQ é suficiente para dezenas de usuários simultâneos.

#### Resumo de custo mensal

| Usuários ativos/dia | Aulas/mês | Custo embeddings | Custo LLM | Total |
|---|---|---|---|---|
| 10 | ~300 | $0 | $0 | **$0** |
| 50 | ~1.500 | $0 | $0 | **$0** |
| 200 | ~6.000 | $0 | $0 | **$0** |
| 500 | ~15.000 | ~$0.72 | $0 | **~$0.72** |
| 1.000 | ~30.000 | ~$3.36 | $0 | **~$3.36** |

### Quando a conta começa a aparecer?

1. **Voyage AI free esgotado** (>200M tokens/mês): só em escala de ~16k aulas/mês
2. **Supabase 500MB esgotado** (>12.500 aulas acumuladas): upgrade para Pro $25/mês
3. **Groq rate limits frequentes**: adicionar fallback Google Gemini (grátis 15 req/min)

### Pior cenário realista (1.000 usuários ativos, 1 aula/dia cada)

```
Embeddings:   ~30M tokens  → $0 (dentro do free tier)
pgvector:     ~1.2GB       → $25/mês (Supabase Pro)
LLM:          Groq free    → $0
Backend:      Railway      → $5/mês
Total:        ~$30/mês para 1.000 usuários = $0.03/usuário/mês
```

---

## 11. Frontend — Mudanças

### TranscriptionPage — de 1 view para tabs

**Atual:**
```
TranscriptionPage
  └── Status + Resumo + Transcrição completa
```

**Fase 2:**
```
TranscriptionPage
  ├── Tab: Resumo (atual)
  ├── Tab: Transcrição (atual)
  ├── Tab: Mapa Mental (novo)  ← polling status do study_material
  ├── Tab: Flashcards (novo)   ← polling status do study_material
  └── Tab: Perguntas (novo)    ← chat RAG
```

### Novos widgets e features (FSD)

```
frontend/src/
  widgets/
    mindmap/
      ui/MindMapViewer.tsx        ← markmap-view
    flashcard-deck/
      ui/FlashcardDeck.tsx        ← flip card + progresso
    rag-chat/
      ui/RagChat.tsx              ← input + histórico de mensagens

  features/
    study/
      poll-materials/
        model/useStudyMaterial.ts ← GET /study-materials/:transcriptionId/:type
      trigger-generation/
        model/useTriggerMaterials.ts (geralmente automático, mas pode ter botão)
    rag/
      ask-question/
        model/useAskQuestion.ts   ← POST /rag/:transcriptionId/ask
        ui/QuestionInput.tsx

  entities/
    study-material/
      model/study-material.types.ts
      model/useStudyMaterialList.ts
```

### Novos endpoints necessários no backend

```
GET  /api/v1/study-materials/:transcriptionId         → lista todos (mindmap, flashcards, quiz)
GET  /api/v1/study-materials/:transcriptionId/:type   → busca específico
POST /api/v1/rag/:transcriptionId/ask                 → Q&A
GET  /api/v1/rag/:transcriptionId/messages            → histórico de perguntas
```

### Libraries frontend novas

```bash
npm install markmap-view markmap-lib   # mind maps
# flashcards: CSS puro com transform rotateY (sem lib)
```

---

## 12. Riscos e Mitigações

### Rate limits do Groq com mais chamadas

**Risco:** Fase 2 adiciona 3 chamadas LLM (flashcards + mindmap + quiz) para cada transcrição que já consumia 2 (transcrição + resumo). Usuários em horário de pico podem acumular fila.

**Mitigação:**
- Jobs de study-materials com prioridade mais baixa que transcrição na fila BullMQ
- Fallback para Google Gemini Flash (15 req/min grátis) para flashcards/mindmap
- Rate limit por usuário já implementado (Fase 1)

### Qualidade dos embeddings em português

**Risco:** Modelos de embedding treinados principalmente em inglês podem ter recall ruim para perguntas em português.

**Mitigação:**
- Voyage voyage-3-lite é explicitamente multilingual e performático em português
- BAAI/bge-m3 (fallback Cloudflare) também é multilingual
- Testar com aulas reais antes de liberar a feature

### Chunks mal formados prejudicam o RAG

**Risco:** Se o chunking cortar no meio de uma explicação, o contexto fica fragmentado e a resposta fica ruim.

**Mitigação:**
- Overlap de 100 tokens entre chunks
- Quebrar preferencialmente em parágrafos (`\n\n`) antes de recorrer a sentenças
- Aulas gravadas tendem a ter boa estrutura de parágrafos após transcrição

### LLM gera JSON inválido (flashcards/quiz)

**Risco:** Llama às vezes adiciona texto antes/depois do JSON ("Aqui estão seus flashcards: [...]")

**Mitigação:**
- Prompt com `Retorne APENAS o JSON array, sem texto adicional`
- Regex fallback para extrair `[\s\S*]` do output
- Se falhar 3x → status FAILED, usuário pode solicitar regeneração

### Limite de 500MB do Supabase com vetores

**Risco:** pgvector usa 2KB/chunk × 20 chunks/aula = 40KB/aula → 12.500 aulas enchem o free tier.

**Mitigação:**
- Deletar chunks ao deletar a transcrição (CASCADE já configurado)
- Monitorar uso no dashboard do Supabase
- Upgrade para Pro ($25/mês) é simples e barato quando necessário

### Tempo de build do HNSW index

**Risco:** Em tabelas grandes, o HNSW index pode demorar para ser construído.

**Mitigação:**
- Criar o index antes de inserir dados (no migration) — build incremental
- Para inserts em batch, usar `SET hnsw.ef_search = 40` apenas durante a busca
- Na escala atual (até 100k chunks), HNSW build é instantâneo

---

## Decisões arquiteturais resumidas

| Decisão | Escolha | Alternativa rejeitada | Motivo |
|---|---|---|---|
| Vector DB | pgvector (Supabase) | Pinecone, Qdrant | Zero infra extra, RLS nativo, já temos Supabase |
| Embeddings | Voyage voyage-3-lite | OpenAI text-embedding-3-small | 200M tokens gratuitos vs pay-per-use |
| Dims do vetor | 512 | 1024 ou 1536 | Compacto, ~metade do armazenamento, qualidade similar |
| Index | HNSW | IVFFlat | Não precisa treinar, melhor recall na nossa escala |
| Mind map format | Markmap (markdown) | JSON + D3.js | LLM gera markdown naturalmente, lib frontend mais simples |
| LLM de materiais | Groq Llama 3.3 70B | GPT-4o-mini | Já em uso, grátis, qualidade suficiente para pt-BR |
| Fallback embed | Cloudflare Workers AI | Hugging Face | Já temos conta Cloudflare (R2), sem nova dependência |
| Trigger geração | Automático pós-COMPLETED | Manual pelo usuário | UX melhor, usuário abre a aba e já está pronto |

---

*Documento criado: Março 2026*
*Stack base: NestJS + Supabase + Groq + Cloudflare R2 + Voyage AI*
