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
| Notificações | Sonner |

---

## Arquitetura — Feature-Sliced Design (FSD)

O frontend segue **Feature-Sliced Design**. A regra de ouro: **camadas superiores importam das inferiores, nunca o contrário.**

```
app → pages → widgets → features → entities → shared
```

### Estrutura completa

```
frontend/src/
  app/
    providers/
      QueryProvider.tsx       # TanStack Query client
      AuthProvider.tsx        # Supabase session listener
      RouterProvider.tsx      # React Router config
    styles/
      globals.css             # CSS custom properties, reset, scrollbar
    App.tsx
    main.tsx

  pages/
    landing/
      ui/
        LandingPage.tsx
    login/
      ui/
        LoginPage.tsx
    auth-callback/
      ui/
        AuthCallbackPage.tsx
    dashboard/
      ui/
        DashboardPage.tsx
    record/
      ui/
        RecordPage.tsx
    transcription/
      ui/
        TranscriptionPage.tsx

  widgets/
    navbar/
      ui/
        Navbar.tsx
    mouse-light/
      ui/
        MouseLight.tsx        # luz radial que segue o cursor
    recording-panel/
      ui/
        RecordingPanel.tsx    # waveform + timer + controles agrupados
    transcription-viewer/
      ui/
        TranscriptionViewer.tsx

  features/
    auth/
      login-with-magic-link/
        ui/
          MagicLinkForm.tsx
        model/
          useMagicLink.ts
      logout/
        ui/
          LogoutButton.tsx
        model/
          useLogout.ts
    recording/
      start-recording/
        ui/
          RecordButton.tsx
        model/
          useRecorder.ts      # MediaRecorder + Web Audio API
      upload-audio/
        model/
          useUploadAudio.ts   # POST /api/v1/audio/upload
    transcription/
      poll-status/
        model/
          useTranscriptionStatus.ts  # polling com TanStack Query
      copy-text/
        ui/
          CopyButton.tsx
        model/
          useCopyText.ts
      delete-audio/
        ui/
          DeleteAudioButton.tsx
        model/
          useDeleteAudio.ts

  entities/
    audio/
      model/
        audio.types.ts        # AudioStatus, AudioEntity
        useAudioList.ts       # GET /api/v1/audio
      ui/
        AudioCard.tsx
        AudioStatusBadge.tsx
    transcription/
      model/
        transcription.types.ts
        useTranscription.ts   # GET /api/v1/transcription/:audioId
      ui/
        TranscriptionCard.tsx
        SummaryCard.tsx
    user/
      model/
        user.types.ts
        useCurrentUser.ts

  shared/
    api/
      axios.ts                # instância com interceptor JWT
      endpoints.ts            # constantes de URL
    auth/
      supabase.ts             # Supabase client singleton
    ui/
      Button/
        Button.tsx
        Button.types.ts
      Input/
        Input.tsx
      Card/
        Card.tsx
      Badge/
        Badge.tsx
      Skeleton/
        Skeleton.tsx
      Waveform/
        Waveform.tsx          # canvas animado Web Audio API
      ProtectedRoute/
        ProtectedRoute.tsx
    hooks/
      useMousePosition.ts     # posição do cursor para o efeito de luz
      useAudioLevel.ts        # dados de amplitude para o waveform
    lib/
      cn.ts                   # clsx + tailwind-merge
    types/
      api.types.ts
    assets/
      logo-favicon.png        # Gemini_Generated_Image_dwy78j... (fundo transparente)
      logo-hero.png           # Gemini_Generated_Image_byi2w9...
      landing-bg.png          # Gemini_Generated_Image_h9xhe5...
```

### Regra de importação entre camadas

| De \ Para | app | pages | widgets | features | entities | shared |
|-----------|-----|-------|---------|----------|----------|--------|
| **app** | — | ok | ok | ok | ok | ok |
| **pages** | — | — | ok | ok | ok | ok |
| **widgets** | — | — | — | ok | ok | ok |
| **features** | — | — | — | — | ok | ok |
| **entities** | — | — | — | — | — | ok |
| **shared** | — | — | — | — | — | — |

---

## Autenticação — Magic Link

- Login exclusivamente via Magic Link (sem senha)
- Template de e-mail personalizado via Supabase Dashboard > Auth > Email Templates
  - Se não for possível customizar: desativar e-mail e usar OTP direto na UI
- Fluxo:
  1. Usuário digita e-mail
  2. Supabase envia magic link
  3. Callback `/auth/callback` captura sessão e redireciona para `/dashboard`
  4. Token JWT gerenciado pelo SDK — nunca armazenar manualmente
- `ProtectedRoute` em `shared/ui` verifica sessão ativa — sem sessão redireciona para `/login`

---

## Estrutura de Rotas

```
/                       → LandingPage
/login                  → LoginPage
/auth/callback          → AuthCallbackPage
/dashboard              → DashboardPage (protegida)
/record                 → RecordPage (protegida)
/transcription/:id      → TranscriptionPage (protegida)
```

---

## Funcionalidades Core

### 1. Gravação em Tempo Real
- `MediaRecorder API` com formato `audio/webm;codecs=opus`
- Visualizador de amplitude com `Web Audio API` (canvas animado) em `shared/ui/Waveform`
- Controles: iniciar, pausar, retomar, parar + enviar
- Timer de duração em tempo real
- Ao parar: upload automático via `features/recording/upload-audio`

### 2. Dashboard
- Lista de áudios via `entities/audio/model/useAudioList`
- Polling automático para itens `PENDING` ou `PROCESSING` a cada 5s
- Cards com status, nome, data
- Deletar via `features/transcription/delete-audio`

### 3. Visualização de Transcrição
- Transcrição completa + resumo estruturado
- Copiar texto via `features/transcription/copy-text`
- Skeleton loading enquanto `PENDING`

---

## Design System

### Paleta de Cores

```css
--bg-base: #080a0f;
--bg-surface: #0e1117;
--bg-elevated: #161b24;
--border: #1e2530;
--text-primary: #e8eaf0;
--text-secondary: #6b7280;
--accent: #6366f1;
--accent-glow: #6366f140;
--danger: #ef4444;
```

### Tipografia
- `Inter` — texto geral
- `JetBrains Mono` — transcrição e timestamps

### Efeitos Visuais

**Landing Page:**
- `widgets/mouse-light` — `mousemove` atualiza CSS custom properties `--mouse-x` e `--mouse-y` aplicadas em `radial-gradient` no fundo
- Grid de pontos com baixa opacidade como textura de fundo
- Hero title com gradiente animado (`background-clip: text`)
- Glassmorphism nos cards (`backdrop-filter: blur`)
- Logo com `mix-blend-mode: lighten` para integrar ao dark theme

**Global:**
- Transições: 200ms ease em todas as interações
- Scrollbar customizada via webkit
- Focus rings com glow accent
- Zero emojis — ícones exclusivamente via Lucide React

### Componentes base (`shared/ui`)
- `Button` — primary, ghost, danger
- `Input` — border glow no focus
- `Card` — glassmorphism sutil
- `Badge` — PENDING (amarelo), PROCESSING (azul), COMPLETED (verde), FAILED (vermelho)
- `Skeleton` — loading states
- `Waveform` — canvas com barras animadas via Web Audio API

---

## Assets — Imagens do Projeto

Copiar de `/images/` para `frontend/src/shared/assets/`:

| Arquivo original | Alias | Uso |
|-----------------|-------|-----|
| `Gemini_Generated_Image_dwy78jdwy78jdwy7-removebg-preview.png` | `logo-favicon.png` | Favicon + logo na Navbar |
| `Gemini_Generated_Image_byi2w9byi2w9byi2-removebg-preview.png` | `logo-hero.png` | Hero da Landing Page |
| `Gemini_Generated_Image_h9xhe5h9xhe5h9xh.png` | `landing-bg.png` | Seção secundária / decorativo |

- Favicon configurado no `index.html` como `<link rel="icon">` e `apple-touch-icon`
- Logos renderizadas com `mix-blend-mode: lighten` sobre dark theme
- Nunca exibir logo com fundo branco visível

---

## Integração com o Backend

### Axios (`shared/api/axios.ts`)
```typescript
instance.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Polling de status
```typescript
useQuery({
  queryKey: ['transcription-status', audioId],
  queryFn: () => api.getAudioStatus(audioId),
  refetchInterval: (query) => {
    const status = query.state.data?.transcription?.status;
    return status === 'COMPLETED' || status === 'FAILED' ? false : 5000;
  },
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

- Nunca quebrar a regra de importação do FSD (camada superior não importa de inferior)
- Nunca usar emojis na UI — somente ícones Lucide
- Nunca armazenar JWT manualmente — Supabase SDK gerencia
- Nunca chamar o backend sem passar pelo `shared/api/axios.ts`
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend
- Nunca usar cores claras como base — dark-first
- Nunca exibir logo com fundo branco sobre o dark theme
- Nunca colocar lógica de negócio em componentes de `shared/ui`
- Nunca importar de `features` dentro de `entities` ou `shared`
