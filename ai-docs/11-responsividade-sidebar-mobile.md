# anotEX.ai — Responsividade e Sidebar Mobile

## Objetivo

Documentar o ajuste de responsividade do frontend com foco em navegação mobile.

O problema principal era estrutural:

- páginas internas sem topbar não tinham um trigger confiável para abrir a sidebar no mobile
- várias telas assumiam layout desktop com espaçamentos, headers e ações rígidas
- cards/listagens quebravam mal em telas pequenas

---

## O que foi implementado

### 1. Sidebar mobile como drawer real

Arquivos centrais:

- `frontend/src/shared/hooks/useSidebarStore.ts`
- `frontend/src/widgets/sidebar/ui/Sidebar.tsx`

Mudanças:

- adição de `open()` no store da sidebar
- botão hambúrguer flutuante nas páginas com `withTopBar={false}`
- overlay escurecido para fechamento por clique fora
- botão de fechar dentro do drawer
- largura da sidebar adaptada ao viewport no mobile
- fechamento automático ao trocar de rota preservado

### 2. Navbar mais robusta em telas pequenas

Arquivo:

- `frontend/src/widgets/navbar/ui/Navbar.tsx`

Mudanças:

- botão hambúrguer com área de toque melhor
- paddings ajustados para mobile
- CTA de gravação menos apertado
- separação visual e ações mais estáveis em telas estreitas

### 3. Shell responsivo global

Arquivo:

- `frontend/src/app/styles/globals.css`

Mudanças:

- `pen-content` com padding menor no mobile
- `pen-page-header` empilhado em telas pequenas
- títulos e subtítulos com escala melhor para viewport reduzido

---

## Páginas ajustadas

As seguintes páginas receberam correções de layout mobile:

- `DashboardPage`
- `TranscriptionPage`
- `TranscriptionsPage`
- `SummariesPage`
- `MindMapsPage`
- `FlashcardsPage`
- `StudyFoldersPage`
- `StudyFolderPage`
- `GroupsPage`
- `GroupDetailPage`
- `ConversationsPage`
- `ChatPage`
- `RecordPage`

Padrões aplicados:

- headers que passam de linha sem quebrar a hierarquia visual
- botões de ação ocupando largura total quando necessário
- listas/cards migrando de linha para coluna no mobile
- badges, timestamps e ações evitando overflow horizontal
- espaço superior extra nas páginas sem navbar para não conflitar com o botão hambúrguer flutuante

---

## Regra prática para próximas telas

Se a página usar:

- `Sidebar withTopBar={false}`:
  ela precisa considerar o trigger mobile flutuante e normalmente deve ter `pt-20 md:pt-8` no conteúdo principal

- `Navbar + Sidebar`:
  a topbar já fornece o trigger mobile, então o conteúdo deve respeitar o `pt-14` do shell atual

Além disso:

- evitar actions row rígida em header
- preferir `flex-col` no mobile e `sm:flex-row` ou `md:flex-row` no desktop
- evitar cards com trailing actions dependentes apenas de hover
- evitar `min-width` rígido em componentes de listagem

---

## Verificação

Verificação executada no ambiente atual:

- `git diff --check -- frontend/src`

Limitação do ambiente:

- não foi possível rodar `npm run build` nem `npm run lint` porque `node`/`npm` não estavam instalados no shell disponível

---

## Próximo passo recomendado

Quando o ambiente tiver Node disponível, rodar:

```bash
cd frontend
npm run build
npm run lint
```

Se ainda houver problemas visuais, priorizar:

1. tabs com muito conteúdo em telas muito estreitas
2. modais com header/action apertados
3. componentes com hover-only actions em mobile
