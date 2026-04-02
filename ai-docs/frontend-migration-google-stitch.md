# anotEX.ai — Migração do Frontend Atual para o Frontend do Google Stitch

## Objetivo

Documentar como vamos migrar o frontend atual do `anotEX.ai` para a nova direção visual e estrutural desenhada no Google Stitch, sem quebrar a arquitetura FSD já existente e sem reescrever comportamento de negócio que já funciona.

Este documento existe para deixar claro que:

- o frontend atual foi lido no código
- o projeto do Stitch foi inspecionado de forma real, não por suposição
- a migração precisa preservar rotas, contratos de dados e regras arquiteturais
- a troca deve ser incremental, não um rewrite cego

---

## Fonte de verdade usada nesta análise

### Frontend atual no repositório

Arquivos-base lidos:

- `frontend/src/app/App.tsx`
- `frontend/src/pages/landing/ui/LandingPage.tsx`
- `frontend/src/pages/dashboard/ui/DashboardPage.tsx`
- `frontend/src/pages/record/ui/RecordPage.tsx`
- `frontend/src/pages/transcription/ui/TranscriptionPage.tsx`
- `frontend/src/pages/study-folders/ui/StudyFoldersPage.tsx`
- `frontend/FRONTEND.md`
- `README.md`
- `AGENTS.md`

### Projeto acessível no Google Stitch

Projeto encontrado:

- `PRD: Redesign anotEX.ai`

Sinal de atualidade confirmado:

- `updateTime: 2026-04-02T16:27:06.205395Z`

Algumas telas recentes acessíveis via Stitch:

- `Landing Page - anotEX.ai (Metro V2)`
- `Dashboard - anotEX.ai (Metro V2)`
- `Página de Gravação - anotEX.ai (Metro)`
- `Transcrições - anotEX.ai (Metro)`
- `Flashcards - anotEX.ai (Metro)`
- `Quizzes - anotEX.ai (Metro)`
- `Pomodoro - anotEX.ai (Metro)`
- `Resumos - anotEX.ai (Metro)`
- `Mapas Mentais - anotEX.ai (Metro)`
- `Login - anotEX.ai`

Conclusão prática:

- sim, eu consigo ver o projeto e as telas recentes acessíveis no Stitch
- não, eu não consigo inferir automaticamente quais elementos você selecionou ao vivo no canvas
- para planejamento de migração, o acesso atual é suficiente

---

## Leitura do estado atual

O frontend atual já tem:

- React 19 + Vite + TypeScript strict
- Feature-Sliced Design
- rotas e fluxo reais funcionando
- componentes e páginas com identidade própria
- tema visual customizado com classes `pen-*`, gradientes e superfícies

Mas o frontend atual ainda está mais próximo de um sistema custom artesanal do que de um design system consolidado. O Stitch já aponta uma direção mais consistente:

- tema claro
- tokens bem definidos
- superfícies por camada tonal
- tipografia mais editorial
- composição mais limpa
- componentes mais sistemáticos entre telas

Isso significa que a migração correta não é “copiar HTML do Stitch”. A migração correta é:

1. extrair linguagem visual e tokens do Stitch
2. traduzir isso para primitives reutilizáveis no frontend
3. refatorar páginas por fatias, preservando comportamento

---

## Princípio central da migração

Vamos migrar a interface, não o produto.

Ou seja:

- rotas permanecem
- queries, hooks e integrações permanecem
- regras de autenticação permanecem
- fluxos de negócio permanecem
- o que muda primeiro é o shell visual, layout, tokens e composição das páginas

Regra operacional:

- comportamento fica no código atual
- aparência e estrutura visual passam a seguir o Stitch

---

## O que deve virar base do novo frontend

### 1. Design tokens

O Stitch já entrega uma base suficientemente clara para criar um design system interno.

Tokens que devem nascer primeiro em `frontend/src/app/styles/globals.css` e/ou `shared/ui`:

- cores de fundo e superfície
- cores de texto
- cores de ação primária, secundária e estado positivo
- raio de borda
- escala de espaçamento
- sombras suaves
- gradientes principais
- tipografia principal e de labels

Direção detectada no Stitch:

- fundo claro `#f7f9fd`
- primário azul `#004ac6` / `#2563eb`
- secundário aqua `#00696b`
- terciário verde `#00631c`
- superfícies em camadas, sem depender de borda forte
- `Plus Jakarta Sans` e `Manrope`

### 2. App shell

Antes de reestilizar tela por tela, precisamos estabilizar:

- topbar
- sidebar
- containers
- grids
- cards
- botões
- campos
- tabs
- badges
- estados vazios
- loading skeletons

Sem isso, cada página vira uma migração isolada e inconsistente.

### 3. Padrões de página

As páginas do Stitch mostram padrões repetidos:

- header com título e ações
- cards tonais em vez de caixas pesadas
- módulos grandes e respirados
- navegação visual mais editorial
- hierarquia por superfície, não por linha divisória

Esses padrões devem ser transformados em blocos reutilizáveis antes de mexer em todas as páginas.

---

## Mapeamento inicial: frontend atual vs Stitch

### Grupo 1: telas com correspondência direta forte

Essas já têm equivalente claro no Stitch e devem ser migradas cedo:

- Landing
- Login
- Dashboard
- Record
- Transcriptions
- Summaries
- Mindmaps
- Flashcards
- Quiz
- Pomodoro

### Grupo 2: telas que provavelmente herdam o sistema novo com pouco atrito

- TranscriptionPage
- StudyFoldersPage
- StudyFolderPage
- GroupsPage
- GroupDetailPage
- ConversationsPage
- ChatPage

### Grupo 3: telas que exigem adaptação funcional além de visual

- TranscriptionPage
  porque combina resumo, transcrição, mindmap, flashcards, quiz, export e share
- Study folders
  porque mistura navegação, recomendações e fluxos próprios
- componentes de chat e review
  porque têm interação mais densa

---

## Estratégia de migração recomendada

### Fase 1 — Congelar a base visual

Objetivo:

- criar o design system do Stitch dentro do frontend atual

Entregas:

- variáveis CSS novas alinhadas ao Stitch
- tipografia configurada
- novos componentes base ou variantes novas em `shared/ui`
- ajuste do shell global

Arquivos prováveis:

- `frontend/src/app/styles/globals.css`
- `frontend/src/shared/ui/Button/Button.tsx`
- `frontend/src/shared/ui/Card/Card.tsx`
- `frontend/src/shared/ui/Input/Input.tsx`
- `frontend/src/shared/ui/Badge/Badge.tsx`
- `frontend/src/widgets/sidebar/ui/Sidebar.tsx`
- `frontend/src/widgets/navbar/ui/Navbar.tsx`

Resultado esperado:

- o projeto passa a suportar a linguagem do Stitch sem duplicar estilo em cada página

### Fase 2 — Migrar as páginas mais estáveis

Objetivo:

- validar a direção visual em telas simples e de alto impacto

Ordem recomendada:

1. `LandingPage`
2. `LoginPage`
3. `DashboardPage`
4. `RecordPage`

Motivo:

- são telas centrais
- têm forte correspondência com Stitch
- ajudam a validar branding, navegação e hierarquia visual cedo

### Fase 3 — Migrar listas de materiais

Objetivo:

- unificar todas as páginas de coleção/lista

Ordem recomendada:

1. `TranscriptionsPage`
2. `SummariesPage`
3. `MindMapsPage`
4. `FlashcardsPage`
5. `QuizPage`
6. `PomodoroPage`

Resultado esperado:

- consistência entre listagens e páginas internas do app autenticado

### Fase 4 — Migrar fluxos complexos

Objetivo:

- adaptar telas onde UI e comportamento estão muito misturados

Escopo:

- `TranscriptionPage`
- `ChatPage`
- `StudyFoldersPage`
- `StudyFolderPage`
- `GroupsPage`
- `GroupDetailPage`
- `ReviewPage`

Aqui a regra é:

- separar layout de comportamento antes de redesenhar em profundidade

### Fase 5 — Polimento e convergência

Objetivo:

- remover estilos legados que ficaram órfãos
- consolidar tokens
- revisar consistência mobile
- fechar lacunas entre Stitch e código

---

## Regras para evitar um rewrite ruim

### Regra 1

Não substituir páginas inteiras com HTML bruto exportado do Stitch.

Motivo:

- quebra FSD
- mistura estrutura gerada com lógica real
- aumenta custo de manutenção

### Regra 2

Não mover lógica de negócio para páginas só porque o Stitch tem outra composição visual.

Motivo:

- o visual muda
- a arquitetura não deve regredir

### Regra 3

Não tentar migrar todas as telas em um único PR.

Motivo:

- blast radius alto
- revisão impossível
- regressão visual e funcional difícil de rastrear

### Regra 4

Cada tela migrada deve preservar:

- rota
- dados carregados
- ações existentes
- estados de loading, empty e error

### Regra 5

Toda tela nova deve respeitar FSD:

- `pages` compõem
- `widgets` organizam blocos
- `features` guardam ações do usuário
- `entities` guardam UI e dados de negócio
- `shared` concentra primitives

---

## Proposta de implementação técnica

### Abordagem recomendada

Criar uma camada de compatibilidade visual antes de trocar telas.

Isso inclui:

- renomear ou complementar tokens `pen-*`
- introduzir tokens do Stitch sem quebrar as páginas atuais
- criar variantes novas em vez de substituir tudo de uma vez

Exemplo de direção:

- manter `pen-page` temporariamente
- adicionar tokens semânticos como `--surface-base`, `--surface-card`, `--text-default`, `--brand-primary`
- migrar páginas gradualmente dessas classes antigas para primitives semânticas

### Estrutura sugerida

Podemos criar algo como:

- `frontend/src/shared/ui/PageShell/`
- `frontend/src/shared/ui/PageHeader/`
- `frontend/src/shared/ui/Surface/`
- `frontend/src/shared/ui/MetricCard/`
- `frontend/src/shared/ui/EmptyState/`
- `frontend/src/shared/ui/SectionCard/`

Assim o Stitch deixa de ser “uma referência solta” e vira código reutilizável.

---

## Riscos reais da migração

### 1. Misturar redesign com refactor funcional

Risco:

- bugs em upload, polling, chat, share e fluxos autenticados

Mitigação:

- PRs visuais pequenos
- preservar hooks e contratos

### 2. Criar um segundo design system paralelo

Risco:

- metade do app usa tokens antigos
- metade usa tokens novos

Mitigação:

- definir primeiro os tokens-base
- documentar componentes migrados

### 3. Divergência entre Stitch e código real

Risco:

- tela bonita no mock, mas sem espaço para estados reais

Mitigação:

- cada implementação deve considerar:
  - loading
  - empty
  - error
  - overflow
  - mobile
  - textos longos

### 4. Importar markup gerado demais

Risco:

- código inflado
- Tailwind/classes sem semântica
- manutenção ruim

Mitigação:

- usar Stitch como referência de estrutura e linguagem visual
- não como fonte literal de implementação final

---

## Critério de pronto por tela migrada

Uma tela só conta como migrada quando:

- corresponde visualmente à direção do Stitch
- mantém o comportamento do frontend atual
- continua responsiva
- não viola FSD
- usa tokens/componentes compartilhados novos
- não duplica lógica existente

---

## Ordem prática recomendada para execução

1. Criar tokens e primitives base do Stitch
2. Migrar `LandingPage`
3. Migrar `LoginPage`
4. Migrar `DashboardPage`
5. Migrar `RecordPage`
6. Migrar páginas de listagem
7. Migrar `TranscriptionPage`
8. Migrar study folders, chat e grupos
9. Remover legado visual obsoleto

---

## Decisão recomendada

Sim, dá para migrar esse frontend atual para a base visual do Google Stitch.

Mas a forma correta é:

- usar o Stitch como referência de design system e composição
- preservar a arquitetura e os fluxos do frontend real
- executar uma migração incremental por camadas e páginas

Não recomendo um rewrite total.

Recomendo uma migração guiada por:

- tokens
- shell
- componentes base
- páginas prioritárias

---

## Próximo passo recomendado

Abrir a execução pela Fase 1 com um PR focado apenas em fundação visual:

- tokens globais
- tipografia
- surfaces
- botões
- inputs
- cards
- shell autenticado

Depois disso, migrar `LandingPage` e `DashboardPage`, que são as telas com melhor retorno visual e melhor aderência às versões recentes vistas no Stitch.
