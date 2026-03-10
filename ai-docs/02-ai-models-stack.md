# anotEX.ai - Modelos de IA, Stack e Infraestrutura

## 📋 Índice

1. [Abordagens: Áudio Direto vs Transcrição + Texto](#-abordagens-áudio-direto-vs-transcrição--texto)
2. [Modelos de IA Recomendados](#-modelos-de-ia-recomendados)
3. [Comparativo de Custos](#-comparativo-de-custos)
4. [Opções de Hospedagem](#-opções-de-hospedagem)
5. [Como Funciona o NotebookLM](#-como-funciona-o-notebooklm)
6. [Arquitetura Proposta para anotEX.ai](#-arquitetura-proposta-para-anotexai)
7. [Trade-offs e Decisões](#-trade-offs-e-decisões)

---

## 🎯 Abordagens: Áudio Direto vs Transcrição + Texto

### Opção A: Enviar Áudio Direto para LLM (Multimodal)

```
Áudio → GPT-4o / Gemini 1.5 (entende áudio) → Resumo
```

**Modelos que aceitam áudio:**
- GPT-4o (OpenAI) - Aceita áudio diretamente
- Gemini 1.5 Pro (Google) - Multimodal nativo
- Claude 3.5 (em breve)

**✅ Prós:**
- Pipeline mais simples (menos etapas)
- Menos latência (uma chamada só)
- Modelo entende entonação, pausas, ênfase

**❌ Contras:**
- **MUITO MAIS CARO** (~$0.006/segundo de áudio no GPT-4o)
- Aula de 1 hora = ~$21.60 só em input de áudio
- Menos controle sobre o processo
- Não consegue salvar transcrição separadamente

### Opção B: Transcrição + LLM de Texto (Recomendado ✅)

```
Áudio → Whisper (transcrição) → Texto → GPT-4/Claude → Resumo
```

**✅ Prós:**
- **MUITO MAIS BARATO** (10-50x mais barato)
- Salva transcrição para referência futura
- Pode usar LLMs mais baratos para resumo
- Mais controle e debugging
- Pode processar texto em chunks

**❌ Contras:**
- Duas etapas = mais complexidade
- Perde informações de entonação
- Latência um pouco maior

### 💰 Comparação de Custo (1 hora de aula)

| Abordagem | Custo Estimado |
|-----------|----------------|
| GPT-4o áudio direto | ~$21.60 |
| Whisper + GPT-4 texto | ~$0.50 - $1.00 |
| Whisper + GPT-3.5 texto | ~$0.10 - $0.20 |
| Groq Whisper + Llama 3 | ~$0.01 - $0.05 |

**🏆 Recomendação: Opção B (Transcrição + Texto) - 20x a 200x mais barato!**

---

## 🤖 Modelos de IA Recomendados

### Para Transcrição (Speech-to-Text)

| Modelo | Preço | Qualidade | Latência | Observações |
|--------|-------|-----------|----------|-------------|
| **OpenAI Whisper API** | $0.006/min | ⭐⭐⭐⭐⭐ | Média | Melhor qualidade geral |
| **Groq Whisper** | Grátis (rate limit) | ⭐⭐⭐⭐⭐ | Muito baixa | Mais rápido do mercado! |
| **Deepgram** | $0.0043/min | ⭐⭐⭐⭐ | Baixa | Bom para streaming |
| **AssemblyAI** | $0.00025/seg | ⭐⭐⭐⭐ | Baixa | Real-time nativo |
| **Google Speech-to-Text** | $0.024/15seg | ⭐⭐⭐⭐ | Média | Caro mas preciso |
| **Whisper Self-hosted** | Só infra | ⭐⭐⭐⭐⭐ | Alta | Grátis mas precisa GPU |

**🏆 Recomendação Inicial: Groq Whisper (grátis) → OpenAI Whisper (quando escalar)**

### Para Geração de Resumos (LLM)

| Modelo | Preço (1M tokens) | Qualidade | Context Window | Observações |
|--------|-------------------|-----------|----------------|-------------|
| **GPT-4o** | $5 input / $15 output | ⭐⭐⭐⭐⭐ | 128K | Melhor qualidade |
| **GPT-4o-mini** | $0.15 input / $0.60 output | ⭐⭐⭐⭐ | 128K | Ótimo custo-benefício! |
| **Claude 3.5 Sonnet** | $3 input / $15 output | ⭐⭐⭐⭐⭐ | 200K | Melhor para textos longos |
| **Claude 3 Haiku** | $0.25 input / $1.25 output | ⭐⭐⭐⭐ | 200K | Barato e bom |
| **Gemini 1.5 Flash** | $0.075 input / $0.30 output | ⭐⭐⭐⭐ | 1M | Contexto gigante! |
| **Llama 3 70B (Groq)** | Grátis (rate limit) | ⭐⭐⭐⭐ | 8K | Grátis! |
| **Mistral Large** | $4 input / $12 output | ⭐⭐⭐⭐ | 32K | Alternativa europeia |

**🏆 Recomendação: GPT-4o-mini (melhor custo-benefício) ou Groq Llama 3 (grátis para MVP)**

---

## 💰 Comparativo de Custos Detalhado

### Cenário: 100 usuários, 5 aulas/semana cada, 1h por aula

**Áudio total/mês:** 100 × 5 × 4 × 60 = 120.000 minutos

| Stack | Custo Transcrição | Custo Resumo | Total/Mês |
|-------|-------------------|--------------|-----------|
| Groq Whisper + Llama 3 | $0 | $0 | **$0** (rate limits) |
| OpenAI Whisper + GPT-4o-mini | $720 | ~$50 | **~$770** |
| OpenAI Whisper + GPT-4o | $720 | ~$500 | **~$1,220** |
| Deepgram + Claude Haiku | $516 | ~$80 | **~$596** |
| Self-hosted Whisper + Llama | ~$200 (GPU) | ~$200 (GPU) | **~$400** |

### Custo por Usuário/Mês

| Stack | Custo/Usuário |
|-------|---------------|
| Groq (grátis) | $0.00 |
| Whisper + GPT-4o-mini | $7.70 |
| Whisper + GPT-4o | $12.20 |
| Self-hosted | $4.00 |

---

## 🏠 Opções de Hospedagem

### APIs Gerenciadas (Mais Fácil)

| Provedor | Serviço | Preço | Quando Usar |
|----------|---------|-------|-------------|
| **OpenAI** | Whisper + GPT | Pay-per-use | Produção, qualidade máxima |
| **Groq** | Whisper + Llama | Grátis (limits) | MVP, prototipagem |
| **Together AI** | Whisper + LLMs | Barato | Alternativa ao OpenAI |
| **Anthropic** | Claude | Pay-per-use | Textos muito longos |
| **Google Cloud** | Gemini + Speech | Pay-per-use | Se já usa GCP |

### Self-Hosted (Mais Barato em Escala)

| Plataforma | Tipo | Preço/Hora GPU | Quando Usar |
|------------|------|----------------|-------------|
| **RunPod** | Serverless GPU | $0.20-0.40/h | Whisper self-hosted |
| **Modal** | Serverless GPU | $0.0001/seg | Paga só quando usa |
| **Replicate** | API de modelos | Pay-per-use | Fácil de usar |
| **Vast.ai** | GPU barata | $0.10-0.30/h | Mais barato |
| **Lambda Labs** | GPU dedicada | $1.10/h (A10) | Produção |

### Hospedagem do Backend

| Plataforma | Tipo | Preço | Observações |
|------------|------|-------|-------------|
| **Railway** | PaaS | $5/mês + uso | Fácil deploy NestJS |
| **Render** | PaaS | Grátis → $7/mês | Bom para começar |
| **Fly.io** | Edge | Pay-per-use | Baixa latência |
| **Vercel** | Serverless | Grátis → $20/mês | Só frontend/edge |
| **AWS EC2** | IaaS | ~$30-100/mês | Mais controle |
| **DigitalOcean** | VPS | $6-24/mês | Simples e barato |
| **Hetzner** | VPS | €4-20/mês | Mais barato da Europa |

### Storage de Áudio

| Serviço | Preço Storage | Preço Egress | Observações |
|---------|---------------|--------------|-------------|
| **Cloudflare R2** | $0.015/GB | **$0** | Sem egress! Recomendo |
| **AWS S3** | $0.023/GB | $0.09/GB | Padrão da indústria |
| **Backblaze B2** | $0.006/GB | $0.01/GB | Mais barato |
| **Supabase Storage** | Grátis 1GB | Incluído | Bom para MVP |

**🏆 Recomendação Storage: Cloudflare R2 (sem custo de download!)**

---

## 🧠 Como Funciona o NotebookLM (Google)

O NotebookLM é um produto do Google que permite:
1. Upload de documentos (PDFs, áudios, vídeos)
2. Geração de resumos automáticos
3. Chat com os documentos (RAG)
4. Geração de "podcasts" a partir do conteúdo
5. Mapas mentais e conexões entre conceitos

### Arquitetura Provável do NotebookLM

```
┌─────────────────────────────────────────────────────────────┐
│                     NOTEBOOKLM ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────────┐   │
│  │  Upload  │───▶│  Processing  │───▶│  Vector Store   │   │
│  │  (Docs)  │    │  Pipeline    │    │  (Embeddings)   │   │
│  └──────────┘    └──────────────┘    └─────────────────┘   │
│       │                │                      │             │
│       │                ▼                      │             │
│       │         ┌──────────────┐              │             │
│       │         │   Chunking   │              │             │
│       │         │  + Metadata  │              │             │
│       │         └──────────────┘              │             │
│       │                │                      │             │
│       ▼                ▼                      ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    GEMINI LLM                        │   │
│  │  - Summarization                                     │   │
│  │  - Q&A (RAG)                                        │   │
│  │  - Podcast Generation (TTS)                         │   │
│  │  - Mind Map Extraction                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    FRONTEND                          │   │
│  │  - Chat Interface                                    │   │
│  │  - Document Viewer                                   │   │
│  │  - Audio Player (Podcasts)                          │   │
│  │  - Mind Map Visualization                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Componentes-Chave para Replicar

1. **RAG (Retrieval Augmented Generation)**
   - Chunking de documentos
   - Embeddings (text-embedding-3-small ou similar)
   - Vector Database (Pinecone, Qdrant, Chroma)
   - Retrieval + LLM para responder perguntas

2. **Summarization Pipeline**
   - Map-Reduce para documentos longos
   - Prompts especializados por tipo de conteúdo

3. **Mind Map Generation**
   - LLM extrai conceitos-chave
   - Identifica relações entre conceitos
   - Output em JSON estruturado
   - Frontend renderiza com D3.js/Mermaid

4. **Podcast Generation (Audio Overview)**
   - LLM gera script conversacional
   - TTS (Text-to-Speech) de alta qualidade
   - ElevenLabs ou OpenAI TTS

---

## 🏗️ Arquitetura Proposta para anotEX.ai

### Fase 1: MVP (Transcrição + Resumo)

```
┌─────────────────────────────────────────────────────────────┐
│                     anotEX.ai MVP                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐                                           │
│  │   Frontend   │  React/Next.js                            │
│  │  - Captura   │  MediaRecorder API                        │
│  │  - Player    │  getUserMedia()                           │
│  │  - UI        │                                           │
│  └──────┬───────┘                                           │
│         │ WebSocket/HTTP                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │   Backend    │  NestJS                                   │
│  │  - API       │  Socket.io                                │
│  │  - Auth      │  JWT                                      │
│  │  - Queue     │  BullMQ                                   │
│  └──────┬───────┘                                           │
│         │                                                    │
│    ┌────┴────┬─────────────┐                                │
│    ▼         ▼             ▼                                │
│ ┌──────┐ ┌──────────┐ ┌─────────┐                          │
│ │ R2   │ │ Postgres │ │ Redis   │                          │
│ │Audio │ │ Data     │ │ Cache   │                          │
│ └──────┘ └──────────┘ └─────────┘                          │
│                                                              │
│         │ Worker Process                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────┐                   │
│  │           AI Pipeline                 │                   │
│  │  1. Groq Whisper → Transcrição       │                   │
│  │  2. GPT-4o-mini → Resumo             │                   │
│  │  3. Salvar resultados                │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fase 2: Mapas Mentais + RAG

```
┌─────────────────────────────────────────────────────────────┐
│                   anotEX.ai v2                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Adicionar ao Pipeline:                                     │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │         Vector Database               │                   │
│  │  - Qdrant (self-hosted) ou           │                   │
│  │  - Pinecone (managed)                │                   │
│  └──────────────────────────────────────┘                   │
│                    │                                         │
│                    ▼                                         │
│  ┌──────────────────────────────────────┐                   │
│  │         RAG Pipeline                  │                   │
│  │  1. Chunk transcrição                │                   │
│  │  2. Gerar embeddings                 │                   │
│  │  3. Armazenar em vector DB           │                   │
│  │  4. Query → Retrieve → Generate      │                   │
│  └──────────────────────────────────────┘                   │
│                    │                                         │
│                    ▼                                         │
│  ┌──────────────────────────────────────┐                   │
│  │       Mind Map Generator              │                   │
│  │  1. LLM extrai conceitos             │                   │
│  │  2. Identifica relações              │                   │
│  │  3. Output JSON estruturado          │                   │
│  │  4. Frontend: D3.js/Markmap          │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fase 3: Podcast/Audio Overview (como NotebookLM)

```
┌──────────────────────────────────────┐
│       Audio Overview Pipeline         │
│  1. LLM gera script conversacional   │
│  2. Dois "hosts" discutem o conteúdo │
│  3. ElevenLabs/OpenAI TTS            │
│  4. Merge áudios                     │
│  5. Disponibiliza para download      │
└──────────────────────────────────────┘
```

---

## ⚖️ Trade-offs e Decisões

### 1. API vs Self-Hosted

| Aspecto | API (OpenAI/Groq) | Self-Hosted |
|---------|-------------------|-------------|
| **Setup** | 5 minutos | Horas/Dias |
| **Custo inicial** | $0 | GPU ~$50-200/mês |
| **Custo em escala** | Alto | Baixo |
| **Manutenção** | Zero | Alta |
| **Qualidade** | Garantida | Depende |
| **Latência** | Baixa | Variável |

**Decisão:** Começar com APIs → Migrar para self-hosted quando escalar

### 2. Real-time vs Batch Processing

| Aspecto | Real-time | Batch |
|---------|-----------|-------|
| **UX** | Melhor (vê resultado na hora) | Espera |
| **Complexidade** | Alta (WebSocket, streaming) | Baixa |
| **Custo** | Pode ser maior | Otimizável |
| **Confiabilidade** | Mais pontos de falha | Mais robusto |

**Decisão:** Batch para MVP → Real-time como feature premium

### 3. Qual LLM usar?

| Cenário | Recomendação |
|---------|--------------|
| MVP/Prototipagem | Groq (grátis) |
| Produção pequena | GPT-4o-mini |
| Textos muito longos | Claude 3.5 Sonnet |
| Máxima qualidade | GPT-4o |
| Self-hosted | Llama 3 70B |

### 4. Onde hospedar?

| Cenário | Recomendação |
|---------|--------------|
| MVP | Railway + Supabase + Groq |
| Produção pequena | DigitalOcean + Cloudflare R2 + OpenAI |
| Produção média | AWS/GCP + self-hosted Whisper |
| Escala | Kubernetes + Modal/RunPod |

---

## 📊 Stack Recomendada Final

### Para MVP (Custo ~$0-20/mês)

```
Frontend:     Next.js (Vercel free tier)
Backend:      NestJS (Railway $5/mês)
Database:     Supabase (free tier)
Storage:      Cloudflare R2 (free tier generoso)
Transcrição:  Groq Whisper (grátis)
Resumo:       Groq Llama 3 (grátis) ou GPT-4o-mini
Cache:        Upstash Redis (free tier)
```

### Para Produção (Custo ~$100-500/mês)

```
Frontend:     Next.js (Vercel Pro)
Backend:      NestJS (Railway ou DigitalOcean)
Database:     PostgreSQL (Supabase Pro ou managed)
Storage:      Cloudflare R2
Transcrição:  OpenAI Whisper
Resumo:       GPT-4o-mini
Vector DB:    Qdrant Cloud ou Pinecone
Queue:        BullMQ + Redis
```

---

## 🚀 Próximos Passos

1. [ ] Configurar projeto NestJS
2. [ ] Implementar captura de áudio (frontend)
3. [ ] Integrar Groq Whisper (transcrição)
4. [ ] Integrar GPT-4o-mini (resumo)
5. [ ] Configurar Cloudflare R2 (storage)
6. [ ] Implementar RAG básico
7. [ ] Criar visualização de mapa mental
8. [ ] Feature de "podcast" (Audio Overview)

---

*Documentação criada em: Março 2026*
*Última atualização: Março 2026*













