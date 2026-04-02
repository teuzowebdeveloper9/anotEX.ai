# Frontend AGENTS Guide

## Propósito

Este arquivo define as regras específicas para qualquer agente que trabalhar no frontend do `anotEX.ai`.

Ele complementa o `AGENTS.md` da raiz do repositório e deve ser tratado como contrato local para:

- migração visual
- implementação de páginas
- decisões de layout
- consistência com o Google Stitch
- uso correto de assets e estados de interface

Se houver conflito entre este arquivo e a realidade do código, preserve a realidade do código e atualize este documento quando a nova direção estiver confirmada.

---

## Regra central da migração

O frontend atual deve ser migrado para a direção visual do Google Stitch.

Essa migração deve seguir esta ordem de prioridade:

1. comportamento real do produto
2. arquitetura FSD existente
3. design system e composição do Stitch
4. refinamento visual e microinterações

Tradução prática:

- não fazer rewrite cego
- não copiar HTML bruto exportado do Stitch
- não quebrar rotas, hooks, queries, auth ou fluxos existentes
- usar o Stitch como base visual e estrutural

---

## Uso obrigatório do Google Stitch

### Quando a tela existe e foi vista no Stitch

A tela implementada no frontend deve seguir prioritariamente:

- linguagem visual
- hierarquia
- ritmo de espaçamento
- composição dos blocos
- direção tipográfica
- sistema de superfícies
- estilo de navegação e ações

Não significa copiar literalmente cada div.
Significa traduzir a intenção do Stitch para código limpo e reutilizável no projeto.

### Quando a tela não foi vista no Stitch

Se uma tela do app não estiver disponível ou não tiver sido vista no Stitch:

- ela deve ser refeita usando como base as telas vistas
- deve herdar o mesmo design system
- deve manter coerência com as páginas irmãs já migradas
- deve parecer parte do mesmo produto, não uma tela improvisada

Regra prática:

- inferir a nova tela a partir das telas vistas mais próximas em função e hierarquia
- preservar consistência visual antes de inventar uma solução isolada

Exemplos:

- telas internas de listagem devem seguir o padrão das listagens vistas no Stitch
- telas de detalhe devem seguir o padrão das páginas densas e modulares já vistas
- telas de fluxo devem seguir o padrão de headers, ações e estados do sistema novo

---

## Uso obrigatório da logo

Sempre usar a logo oficial do `anotEX.ai` disponível em `images/` na raiz do projeto como referência principal de marca.

Assets identificados no projeto:

- `images/Gemini_Generated_Image_dwy78jdwy78jdwy7-removebg-preview.png`
- `images/Gemini_Generated_Image_byi2w9byi2w9byi2-removebg-preview.png`
- `images/Gemini_Generated_Image_h9xhe5h9xhe5h9xh.png`

Regras:

- priorizar a logo principal já usada pelo produto
- evitar substituir a identidade visual por assets genéricos do Stitch
- se for necessário criar loading, splash, header, login, empty state ou hero, usar a marca do projeto como base
- não introduzir logo nova sem pedido explícito

---

## Loading e estados de interface

Toda tela nova ou migrada deve considerar explicitamente:

- `loading`
- `empty`
- `error`
- `success`
- `partial data`
- `disabled action`
- `long content`
- `mobile`

### Loading

O frontend deve ter um sistema visual coerente de loading.

Sempre que fizer sentido:

- criar ou reutilizar skeletons
- usar loading states que pareçam parte do design system novo
- considerar loading global para transições mais pesadas
- considerar loading de seção, não só loading da página inteira

Quando houver loading branded:

- preferir usar a logo do `anotEX.ai`
- o loading deve parecer um componente do produto, não um placeholder genérico

### Empty state

Empty states devem:

- explicar o que está faltando
- indicar a próxima ação
- manter o tom visual do produto
- evitar tela “morta”

### Error state

Estados de erro devem:

- ser claros
- oferecer retry quando aplicável
- não expor detalhes técnicos desnecessários
- preservar hierarquia visual consistente

---

## Experiência do usuário

A migração não é só estética.

Toda implementação deve melhorar a experiência quando possível, sem quebrar escopo.

Isso inclui:

- headers mais claros
- ações mais descobríveis
- hierarquia de informação melhor
- feedback visual melhor
- estados de processamento mais úteis
- flows mais legíveis
- melhor leitura em desktop e mobile

Sempre considerar:

- latência percebida
- textos longos
- ações críticas
- clareza de navegação
- previsibilidade de comportamento

---

## Direção visual obrigatória

O frontend migrado deve seguir esta direção:

- design claro
- superfícies tonais em camadas
- cards mais respirados
- tipografia forte e editorial
- bordas discretas ou quase invisíveis
- profundidade por superfície e sombra suave, não por caixas pesadas
- ações primárias com presença clara
- consistência entre páginas públicas e autenticadas

Evitar:

- dark mode como padrão nesta migração
- visual genérico de dashboard SaaS
- blocos excessivamente quadrados e rígidos
- excesso de linhas divisórias
- mistura de estilos antigos e novos dentro da mesma tela

---

## Regras técnicas de implementação

### Arquitetura

Continuar respeitando FSD:

- `app` compõe providers, router e base visual global
- `pages` compõem a tela
- `widgets` agrupam blocos relevantes
- `features` guardam comportamento acionável pelo usuário
- `entities` guardam UI de negócio e acesso a dados do domínio
- `shared` guarda primitives, hooks genéricos, tokens e utilitários

### Design system

Não espalhar estilo solto por página.

Antes de repetir markup/estilo várias vezes:

- extrair primitive
- criar variant
- consolidar token

Priorizar a criação e evolução de:

- page shells
- page headers
- cards/surfaces
- buttons
- tabs
- badges
- inputs
- empty states
- loading states

### Migração incremental

Migrar por camadas:

1. tokens e base visual
2. shell e primitives
3. páginas simples e centrais
4. páginas complexas
5. limpeza de legado

Não tentar migrar o frontend inteiro em uma única mudança.

---

## Critério de qualidade para uma tela migrada

Uma tela só pode ser considerada pronta quando:

- está coerente com a direção do Stitch
- preserva o comportamento do produto real
- respeita FSD
- considera loading, empty e error
- funciona em mobile e desktop
- usa a marca do `anotEX.ai` corretamente quando aplicável
- não parece um mock colado

---

## Regra para decisões em telas não vistas

Se a tela não estiver disponível no Stitch:

- usar analogia com telas vistas
- manter a mesma gramática visual
- documentar a inferência quando a decisão for relevante

A inferência deve ser:

- conservadora na estrutura
- consistente no visual
- forte na experiência

Nunca fazer uma tela “qualquer” só para preencher lacuna.

---

## Política de documentação

Sempre que a migração consolidar um novo padrão recorrente do frontend, atualizar:

- este `frontend/AGENTS.md`
- `frontend/FRONTEND.md` se a mudança virar padrão estrutural
- `ai-docs/*.md` se a mudança virar playbook ou estratégia de execução

---

## Resumo operacional

Para qualquer agente atuando no frontend:

- use o Google Stitch como referência principal das telas vistas
- recrie as telas não vistas a partir dessa mesma base
- use sempre a logo oficial do `anotEX.ai` da pasta `images/` quando a marca for necessária
- trate loading, empty, error e transições como parte do escopo
- melhore a experiência, não só a aparência
- preserve o comportamento real e a arquitetura já existente
