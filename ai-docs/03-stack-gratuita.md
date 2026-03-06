# anotEX.ai - Stack 100% Gratuita (Só Paga Infra)

## 🎯 Objetivo

Rodar o anotEX.ai pagando **ZERO** em APIs de IA, usando apenas:
- Tiers gratuitos de serviços
- Modelos open-source
- Rate limits generosos

---

## 💰 Stack Gratuita Completa

### Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                 STACK 100% GRATUITA                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND          │  BACKEND           │  IA                │
│  ─────────────────│──────────────────│─────────────────    │
│  Vercel (free)     │  Railway (free)    │  Groq (free)       │
│  ou Cloudflare     │  ou Render         │  - Whisper         │
│  Pages             │  ou Fly.io         │  - Llama 3 70B     │
│                    │                    │  - Mixtral         │
│                                                              │
│  DATABASE          │  STORAGE           │  VECTOR DB         │
│  ─────────────────│──────────────────│─────────────────    │
│  Supabase (free)   │  Cloudflare R2     │  Qdrant Cloud      │
│  - 500MB           │  - 10GB free       │  - 1GB free        │
│  - Postgres        │  - 0 egress        │  ou Supabase       │
│                    │                    │  pgvector          │
│                                                              │
│  CACHE             │  AUTH              │  EXTRAS            │
│  ─────────────────│──────────────────│─────────────────    │
│  Upstash Redis     │  Supabase Auth     │  Resend (email)    │
│  - 10K req/dia     │  - 50K MAU free    │  - 100 emails/dia  │
│                    │                    │                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 IA Gratuita - Detalhes

### Groq (Principal - MUITO Generoso!)

| Modelo | Rate Limit | Tokens/Minuto | Uso |
|--------|------------|---------------|-----|
| **Whisper Large v3** | 20 req/min | - | Transcrição |
| **Llama 3 70B** | 30 req/min | 6.000 | Resumos |
| **Llama 3 8B** | 30 req/min | 6.000 | Tarefas simples |
| **Mixtral 8x7B** | 30 req/min | 5.000 | Alternativa |
| **Gemma 7B** | 30 req/min | 15.000 | Rápido |

**Limites Diários Groq:**
- ~14.400 requests/dia (considerando rate limits)
- Suficiente para ~200-500 usuários ativos/dia

### Alternativas Gratuitas

| Serviço | Free Tier | Observações |
|---------|-----------|-------------|
| **Google AI Studio** | 60 req/min Gemini | Muito generoso! |
| **Anthropic** | $5 crédito inicial | Acaba rápido |
| **OpenRouter** | Alguns modelos free | Llama, Mistral |
| **Hugging Face** | Inference API free | Lento, rate limits |
| **Cloudflare AI** | 10K neurons/dia | Workers AI |
| **Together AI** | $25 crédito | Para começar |

### Combinação Recomendada

```
Transcrição:  Groq Whisper (primário)
              ↓ se rate limit
              Cloudflare Whisper (backup)

Resumos:      Groq Llama 3 70B (primário)
              ↓ se rate limit
              Google Gemini Flash (backup)
              ↓ se rate limit
              Cloudflare Llama (backup)
```

---

## 🏠 Infraestrutura Gratuita

### Frontend

| Serviço | Free Tier | Limite |
|---------|-----------|--------|
| **Vercel** | 100GB bandwidth | Hobby plan |
| **Cloudflare Pages** | Ilimitado | Melhor opção! |
| **Netlify** | 100GB bandwidth | Bom |
| **GitHub Pages** | Ilimitado | Só estático |

**Recomendação:** Cloudflare Pages (ilimitado!)

### Backend

| Serviço | Free Tier | Limite |
|---------|-----------|--------|
| **Railway** | $5 crédito/mês | ~500h |
| **Render** | 750h/mês | Dorme após 15min |
| **Fly.io** | 3 VMs shared | 256MB RAM cada |
| **Koyeb** | 1 nano instance | 512MB RAM |
| **Deta Space** | Ilimitado | Limitações |

**Recomendação:** Railway ($5 crédito) ou Render (free)

### Database

| Serviço | Free Tier | Limite |
|---------|-----------|--------|
| **Supabase** | 500MB + 2GB transfer | Pausa após 1 semana inativo |
| **PlanetScale** | 1 DB, 1B rows read | MySQL |
| **Neon** | 512MB | Postgres serverless |
| **Turso** | 9GB | SQLite edge |
| **CockroachDB** | 10GB | Distribuído |

**Recomendação:** Supabase (Postgres + Auth + Storage)

### Storage (Áudio)

| Serviço | Free Tier | Egress |
|---------|-----------|--------|
| **Cloudflare R2** | 10GB | **$0 SEMPRE** |
| **Supabase Storage** | 1GB | Incluído |
| **Backblaze B2** | 10GB | $0.01/GB |

**Recomendação:** Cloudflare R2 (sem custo de download!)

### Cache/Queue

| Serviço | Free Tier | Limite |
|---------|-----------|--------|
| **Upstash Redis** | 10K commands/dia | Suficiente MVP |
| **Upstash Kafka** | 10K messages/dia | Filas |
| **Railway Redis** | Incluído nos $5 | - |

---

## 📊 Estimativa de Capacidade (Stack Gratuita)

### Limites Reais por Dia

```
Groq Whisper:     ~1.440 transcrições (20/min × 60 × 24 ÷ 2)
Groq Llama 3:     ~2.160 resumos (30/min × 60 × 24 ÷ 2)
Supabase:         ~10.000 queries
Upstash Redis:    10.000 commands
Cloudflare R2:    10GB storage, ilimitado download
```

### Usuários Suportados

| Cenário | Usuários/Dia | Aulas/Dia |
|---------|--------------|-----------|
| **Conservador** | 50-100 | 100-200 |
| **Otimizado** | 200-400 | 400-800 |
| **Com fallbacks** | 500+ | 1000+ |

### Cálculo Exemplo

```
1 aula = 1 hora de áudio
      = 1 transcrição Whisper (~3-5 min processamento)
      = 1-3 chamadas LLM para resumo
      = ~5MB de áudio armazenado

100 aulas/dia:
- Groq Whisper: 100 requests ✅ (limite: 1.440)
- Groq Llama: 300 requests ✅ (limite: 2.160)
- Storage: 500MB/dia ✅ (limite: 10GB)
- DB: ~5.000 queries ✅ (limite: 10.000)
```

---

## ⚠️ Trade-offs da Stack Gratuita

### 1. Rate Limits

| Problema | Impacto | Solução |
|----------|---------|---------|
| Groq tem limite de 20-30 req/min | Não pode processar muitas aulas simultâneas | Implementar fila + retry |
| Picos de uso | Usuários esperam mais | Queue com prioridade |
| Horários de pico | Pode falhar | Múltiplos providers como fallback |

**Mitigação:**
```typescript
// Sistema de fallback
async function transcribe(audio: Buffer) {
  try {
    return await groqWhisper(audio);
  } catch (rateLimitError) {
    return await cloudflareWhisper(audio);
  }
}
```

### 2. Cold Starts

| Serviço | Cold Start | Impacto |
|---------|------------|---------|
| Render | 30-60 segundos | Primeira request lenta |
| Railway | 5-10 segundos | Menor impacto |
| Vercel Serverless | 1-3 segundos | Quase imperceptível |

**Mitigação:**
- Usar health checks para manter warm
- Cloudflare Workers (0ms cold start)
- Aceitar latência inicial

### 3. Limites de Storage

| Problema | Limite | Solução |
|----------|--------|---------|
| Supabase DB | 500MB | Limpar dados antigos |
| R2 Storage | 10GB | Comprimir áudio, deletar após 30 dias |
| Upstash | 10K/dia | Cache inteligente |

**Mitigação:**
```typescript
// Auto-cleanup de áudios antigos
@Cron('0 0 * * *') // Todo dia meia-noite
async cleanOldAudios() {
  await this.storageService.deleteOlderThan(30); // 30 dias
}
```

### 4. Qualidade vs Custo

| Aspecto | Gratuito | Pago |
|---------|----------|------|
| Velocidade Whisper | Groq é MUITO rápido | Similar |
| Qualidade transcrição | Igual (mesmo modelo) | Igual |
| Qualidade resumo | Llama 3 70B é excelente | GPT-4 é melhor |
| Confiabilidade | 95% | 99.9% |
| Suporte | Comunidade | Oficial |

**Realidade:** Llama 3 70B é ~90% da qualidade do GPT-4 para resumos!

### 5. Vendor Lock-in

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Groq muda pricing | Alto | Abstrair providers |
| Supabase remove free tier | Médio | Backup para Neon |
| Cloudflare muda R2 | Baixo | S3-compatible = fácil migrar |

**Mitigação:** Usar abstrações

```typescript
// Interface genérica
interface TranscriptionProvider {
  transcribe(audio: Buffer): Promise<string>;
}

// Implementações
class GroqWhisper implements TranscriptionProvider { }
class OpenAIWhisper implements TranscriptionProvider { }
class CloudflareWhisper implements TranscriptionProvider { }

// Fácil trocar
const provider = config.useGroq ? new GroqWhisper() : new OpenAIWhisper();
```

---

## 🏆 Stack Gratuita Recomendada Final

### Tier 1: 100% Grátis

```yaml
Frontend:
  provider: Cloudflare Pages
  custo: $0
  limite: Ilimitado

Backend:
  provider: Render (free) ou Railway ($5 crédito)
  custo: $0
  limite: 750h/mês ou $5 crédito

Database:
  provider: Supabase
  custo: $0
  limite: 500MB, pausa se inativo

Storage:
  provider: Cloudflare R2
  custo: $0
  limite: 10GB, $0 egress

Cache:
  provider: Upstash Redis
  custo: $0
  limite: 10K req/dia

Auth:
  provider: Supabase Auth
  custo: $0
  limite: 50K MAU

IA - Transcrição:
  provider: Groq Whisper
  custo: $0
  limite: 20 req/min

IA - Resumo:
  provider: Groq Llama 3 70B
  custo: $0
  limite: 30 req/min

Vector DB:
  provider: Supabase pgvector
  custo: $0
  limite: Incluído no 500MB
```

### Custo Total: $0/mês* 

*Railway usa $5 de crédito grátis por mês

---

## 📈 Quando Migrar para Pago?

### Sinais de que precisa escalar:

1. **Rate limits frequentes** (>10% das requests)
2. **Fila de processamento >5 minutos**
3. **Storage chegando em 80%**
4. **Usuários reclamando de lentidão**
5. **>500 usuários ativos/dia**

### Migração Gradual

```
Fase 1 (0-500 usuários): 100% gratuito
         ↓
Fase 2 (500-2000): Pagar só transcrição (OpenAI Whisper ~$50/mês)
         ↓
Fase 3 (2000-5000): + GPT-4o-mini (~$100/mês)
         ↓
Fase 4 (5000+): Infra dedicada (~$500/mês)
```

---

## 🛠️ Implementação Prática

### 1. Setup Inicial (15 minutos)

```bash
# 1. Criar conta Groq
# https://console.groq.com

# 2. Criar conta Supabase
# https://supabase.com

# 3. Criar conta Cloudflare
# https://cloudflare.com

# 4. Criar projeto NestJS
npx @nestjs/cli new anotex-backend

# 5. Instalar dependências
cd anotex-backend
npm install groq-sdk @supabase/supabase-js
```

### 2. Configurar Providers

```typescript
// src/config/ai.config.ts
export const aiConfig = {
  transcription: {
    primary: 'groq',
    fallback: 'cloudflare',
    groq: {
      apiKey: process.env.GROQ_API_KEY,
      model: 'whisper-large-v3',
    },
  },
  summary: {
    primary: 'groq',
    fallback: 'google',
    groq: {
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama3-70b-8192',
    },
    google: {
      apiKey: process.env.GOOGLE_AI_KEY,
      model: 'gemini-1.5-flash',
    },
  },
};
```

### 3. Serviço com Fallback

```typescript
// src/services/transcription.service.ts
@Injectable()
export class TranscriptionService {
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async transcribe(audioBuffer: Buffer): Promise<string> {
    try {
      // Tentar Groq primeiro
      const result = await this.groq.audio.transcriptions.create({
        file: audioBuffer,
        model: 'whisper-large-v3',
        language: 'pt',
      });
      return result.text;
    } catch (error) {
      if (error.status === 429) {
        // Rate limit - usar fallback
        console.log('Groq rate limited, using fallback...');
        return this.fallbackTranscribe(audioBuffer);
      }
      throw error;
    }
  }

  private async fallbackTranscribe(audio: Buffer): Promise<string> {
    // Cloudflare Workers AI ou Google Speech
    // Implementar aqui
  }
}
```

---

## ✅ Checklist para Começar

- [ ] Criar conta Groq (API key)
- [ ] Criar conta Supabase (projeto + API keys)
- [ ] Criar conta Cloudflare (R2 bucket)
- [ ] Setup NestJS com providers
- [ ] Implementar sistema de fallback
- [ ] Configurar filas (Upstash ou BullMQ)
- [ ] Deploy no Render/Railway
- [ ] Frontend no Cloudflare Pages
- [ ] Testar rate limits
- [ ] Monitorar uso

---

## 🎯 Resumo dos Trade-offs

| Aspecto | Gratuito | Impacto Real |
|---------|----------|--------------|
| **Velocidade** | Igual ou melhor (Groq é rápido!) | ✅ Nenhum |
| **Qualidade** | 90% do pago | ✅ Aceitável |
| **Confiabilidade** | 95% vs 99.9% | ⚠️ Precisa fallbacks |
| **Escalabilidade** | Até ~500 users/dia | ⚠️ Limite real |
| **Complexidade** | Mais código (fallbacks) | ⚠️ Mais trabalho |
| **Risco** | Providers podem mudar | ⚠️ Abstrair código |

### Veredicto: **VALE A PENA COMEÇAR GRÁTIS!** 🚀

A stack gratuita é perfeitamente viável para:
- MVP e validação
- Primeiros 100-500 usuários
- Testar product-market fit
- Aprender sem gastar

Só migre para pago quando **precisar**, não antes!

---

*Documentação criada em: Março 2026*




