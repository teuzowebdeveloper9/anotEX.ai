# anotEX.ai — Frontend Planning

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Vite + React 19 + TypeScript (strict) |
| Roteamento | React Router v7 |
| Estado global | Zustand |
| Server state | TanStack Query v5 |
| Estilização | Tailwind CSS v4 + CSS custom properties |
| Ícones | Lucide React |
| Animações | Framer Motion |
| Auth | Supabase JS SDK (Magic Link) |
| Gravação | MediaRecorder API (nativo) |
| HTTP | Axios (com interceptors para JWT) |

---

## Autenticação — Magic Link

- Login exclusivamente via Magic Link (sem senha)
- Template de e-mail personalizado via Supabase Dashboard > Auth > Email Templates
  - Se não for possível customizar satisfatoriamente: desativar e-mail e usar OTP direto na UI
- Fluxo:
  1. Usuário digita e-mail
  2. Supabase envia magic link
  3. Callback redireciona para `/dashboard`
  4. Token JWT armazenado via Supabase session (localStorage gerenciado pelo SDK)
- Rotas protegidas via `ProtectedRoute` component que verifica sessão ativa

---

## Estrutura de Rotas

```
/                   → Landing Page
/login              → Tela de autenticação (Magic Link)
/auth/callback      → Callback do Supabase após magic link
/dashboard          → Lista de gravações do usuário
/record             → Gravação em tempo real
/transcription/:id  → Visualização de transcrição + resumo
```

---

## Funcionalidades Core

### 1. Gravação em Tempo Real
- `MediaRecorder API` com formato `audio/webm;codecs=opus`
- Visualizador de áudio em tempo real com `Web Audio API` (waveform animado)
- Controles: iniciar, pausar, retomar, parar + enviar
- Timer de duração visível durante gravação
- Limite visual de 100MB (calculado em tempo real)
- Ao parar: upload automático via `POST /api/v1/audio/upload`

### 2. Dashboard
- Lista de todas as gravações do usuário com status
- Status com polling automático via TanStack Query para itens `PENDING`
- Intervalo de polling: 5s enquanto status = PENDING | PROCESSING
- Cards com: nome do arquivo, data, status, duração
- Ação de deletar com confirmação

### 3. Visualização de Transcrição
- Transcrição completa com scroll
- Resumo estruturado destacado
- Botão de copiar para ambos (transcrição e resumo)
- Status de processamento com skeleton loading

---

## Design System

### Paleta de Cores

```css
--bg-base: #080a0f;        /* fundo principal */
--bg-surface: #0e1117;     /* cards, painéis */
--bg-elevated: #161b24;    /* hover, inputs */
--border: #1e2530;         /* bordas sutis */
--text-primary: #e8eaf0;   /* texto principal */
--text-secondary: #6b7280; /* texto secundário */
--accent: #6366f1;         /* indigo — cor de destaque */
--accent-glow: #6366f140;  /* glow do accent */
--danger: #ef4444;
```

### Tipografia
- Font: `Inter` (Google Fonts) — sans-serif, moderna, legível
- Mono: `JetBrains Mono` — para transcrição e timestamps

### Efeitos Visuais

**Landing Page:**
- Fundo escuro com **radial gradient** que segue o cursor do mouse (mousemove → CSS custom properties → `radial-gradient`)
- Partículas sutis ou grid de pontos com baixa opacidade
- Hero title com gradiente animado no texto (`background-clip: text`)
- Glassmorphism nos cards (`backdrop-filter: blur`)
- Bordas com gradiente luminoso (`border-image` ou pseudo-element)

**Global:**
- Transições suaves em todas as interações (200ms ease)
- Focus rings com cor accent + glow
- Scrollbar customizada (webkit)
- Sem emojis — ícones exclusivamente via Lucide React

### Componentes Base
- `Button` — variantes: primary, ghost, danger
- `Input` — dark, com border glow no focus
- `Card` — glassmorphism sutil
- `Badge` — status: PENDING (amarelo), PROCESSING (azul), COMPLETED (verde), FAILED (vermelho)
- `Skeleton` — loading states
- `Toast` — notificações (biblioteca: Sonner)

---

## Estrutura de Pastas

```
frontend/
  src/
    assets/
    components/
      ui/               # Button, Input, Card, Badge, Skeleton, Toast
      layout/           # Navbar, Sidebar, ProtectedRoute
      recording/        # RecordButton, Waveform, Timer
      transcription/    # TranscriptionView, SummaryCard, StatusBadge
    pages/
      Landing.tsx
      Login.tsx
      AuthCallback.tsx
      Dashboard.tsx
      Record.tsx
      TranscriptionDetail.tsx
    hooks/
      useRecorder.ts    # MediaRecorder logic
      useAudioLevel.ts  # Web Audio API waveform data
      useAuth.ts        # Supabase session
    lib/
      supabase.ts       # Supabase client
      axios.ts          # Axios instance com JWT interceptor
      api.ts            # Funções de chamada à API
    store/
      auth.store.ts     # Zustand — sessão do usuário
    types/
      api.types.ts      # tipos das respostas do backend
    App.tsx
    main.tsx
```

---

## Integração com o Backend

### Axios Interceptor
```typescript
// Injeta JWT em toda requisição automaticamente
axios.interceptors.request.use(async (config) => {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Polling de Status
```typescript
// TanStack Query com refetchInterval condicional
useQuery({
  queryKey: ['audio-status', audioId],
  queryFn: () => api.getAudioStatus(audioId),
  refetchInterval: (data) =>
    data?.transcription?.status === 'COMPLETED' || data?.transcription?.status === 'FAILED'
      ? false
      : 5000,
});
```

---

## Variáveis de Ambiente

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## O que NÃO fazer

- Nunca usar emojis na UI — somente ícones Lucide
- Nunca armazenar JWT manualmente — deixar o Supabase SDK gerenciar
- Nunca chamar o backend diretamente sem o interceptor de auth
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend
- Nunca usar cores claras como base — o design é dark-first

---

## Assets — Imagens do Projeto

Todas as imagens estão em `/images/` na raiz do repositório e devem ser copiadas para `frontend/src/assets/` no setup inicial.

| Arquivo | Uso |
|---------|-----|
| `Gemini_Generated_Image_dwy78jdwy78jdwy7-removebg-preview.png` | **Favicon** + logo principal (fundo transparente, versão graffiti) |
| `Gemini_Generated_Image_byi2w9byi2w9byi2-removebg-preview.png` | Landing page — hero ou seção de destaque |
| `Gemini_Generated_Image_h9xhe5h9xhe5h9xh.png` | Landing page — seção secundária ou background decorativo |

### Regras de uso
- O favicon usa a logo com fundo transparente — configurar via `index.html` com link para `.ico` e `apple-touch-icon`
- Na landing page, usar `mix-blend-mode` adequado para integrar ao fundo escuro sem borda branca visível
- Preferir sempre as versões `-removebg-preview` (fundo transparente)
- Nunca exibir a logo com fundo branco sobre o dark theme

---

## Claude Code — Instruções para o Frontend

Bloco para adicionar ao `CLAUDE.md` do projeto:

```
## Frontend

- Stack: Vite + React 19 + TypeScript strict
- Tailwind CSS v4, Framer Motion, Lucide React
- TanStack Query v5, Zustand, React Router v7
- Supabase JS SDK (Magic Link), Axios com interceptor JWT

### Design
- Dark-first: fundo base #080a0f, accent indigo #6366f1
- Nunca usar emojis — ícones exclusivamente via Lucide React
- Landing page com luz radial seguindo o mouse (mousemove → CSS custom properties → radial-gradient)
- Glassmorphism em cards (backdrop-filter: blur)

### Assets
- Favicon: images/Gemini_Generated_Image_dwy78jdwy78jdwy7-removebg-preview.png
- Imagens da landing: /images/ (3 arquivos disponíveis)
- Nunca exibir logos com fundo branco sobre dark theme

### Regras
- Nunca armazenar JWT manualmente — Supabase SDK gerencia sessão
- Nunca expor SUPABASE_SERVICE_ROLE_KEY no frontend
- Todo acesso ao backend via src/lib/axios.ts (interceptor de auth já configurado)
- Polling de status via TanStack Query com refetchInterval condicional (5s se PENDING/PROCESSING)
- Gravação: MediaRecorder API, formato audio/webm;codecs=opus
```
