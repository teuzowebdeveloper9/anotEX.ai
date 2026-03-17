# Como trabalhar com o agente neste projeto

Este diretório passa a ser a base dos workflows de IA do `anotEX.ai`.

O arranjo recomendado é:

- `AGENTS.md`: regras persistentes do repositório
- `ai-docs/*.md`: playbooks, decisões, prompts e contexto complementar
- scripts do projeto: automações repetíveis que o agente pode executar

Se você quiser um fluxo parecido com "skills", pense assim:

1. Regra permanente vai para `AGENTS.md`
2. Processo recorrente vai para `ai-docs/`
3. Tarefa executável vira script ou comando documentado

---

## Como me acionar melhor

Peça sempre com:

- objetivo claro
- escopo
- arquivos ou área do sistema
- tipo de trabalho esperado
- nível de autonomia

Exemplos bons:

```text
Leia AGENTS.md, analise o módulo study-folders e implemente a correção no backend sem mexer no frontend.
```

```text
Quero revisão de código. Foque em bugs, regressões e testes faltando neste diff.
```

```text
Antes de alterar qualquer coisa, leia CLAUDE.md, AGENTS.md e os últimos 5 commits dessa feature. Depois faça um plano curto e implemente.
```

```text
Crie um workflow reutilizável para adicionar endpoints NestJS nesse projeto e documente em ai-docs/backend-endpoint-workflow.md.
```

---

## Tipos de pedido que funcionam melhor

### 1. Implementação direta

Use quando você quer que eu resolva:

```text
Implemente X no módulo Y, siga AGENTS.md e valide com os testes mínimos necessários.
```

### 2. Análise antes da mudança

Use quando a mudança é arriscada:

```text
Entenda o estado atual, leia os arquivos relacionados, explique o problema e só depois faça a implementação.
```

### 3. Review

Use quando você já alterou algo:

```text
Faça review desse estado atual com foco em bugs, regressões, arquitetura e lacunas de teste.
```

### 4. Arquitetura

Use quando quer decisão antes de codar:

```text
Me ajude a arquitetar essa feature no padrão atual do projeto. Quero opções, trade-offs e depois a implementação escolhida.
```

### 5. Workflow repetível

Use quando quer transformar um processo em rotina:

```text
Documente um workflow reutilizável para adicionar providers, endpoints, migrations ou telas novas, alinhado ao projeto.
```

---

## O equivalente a "skills" comigo

Você pode montar um sistema bem próximo de skills com estas camadas:

### Camada 1: `AGENTS.md`

Coloque aqui o que eu devo sempre obedecer:

- arquitetura
- convenções de naming
- regras de teste
- regras de segurança
- preferências de revisão
- comandos padrão de verificação

### Camada 2: playbooks em `ai-docs/`

Crie documentos específicos como:

- `ai-docs/backend-workflow.md`
- `ai-docs/frontend-workflow.md`
- `ai-docs/review-checklist.md`
- `ai-docs/supabase-migration-workflow.md`
- `ai-docs/release-checklist.md`

Cada um pode descrever:

- quando usar
- sequência de passos
- arquivos normalmente envolvidos
- checklist de validação
- prompts prontos

### Camada 3: scripts

Quando um processo for sempre igual, vale transformar em script. Exemplos:

- rodar testes específicos
- validar build backend/frontend
- gerar arquivos base
- checar convenções

Depois você pode me pedir:

```text
Use o workflow de endpoint backend e execute o script de validação ao final.
```

---

## Quando atualizar o `AGENTS.md`

Atualize o `AGENTS.md` quando mudar:

- stack
- arquitetura
- regras de camada
- estratégia de testes
- padrão de commits
- estilo de colaboração comigo

Prompt útil:

```text
Atualize o AGENTS.md para refletir o estado atual do projeto e os novos padrões que decidimos nesta conversa.
```

---

## Como me dar contexto sem repetir tudo sempre

Em vez de explicar tudo do zero a cada tarefa, use este padrão:

```text
Siga AGENTS.md e considere ai-docs/backend-workflow.md.
Tarefa: ...
Escopo: ...
Arquivos principais: ...
Restrições: ...
Validação esperada: ...
```

Isso reduz retrabalho e me deixa mais consistente.

---

## Templates de prompt

### Correção

```text
Leia AGENTS.md.
Entenda o problema no estado atual do código.
Corrija sem fazer refactor amplo.
Se mexer em regra de negócio, adicione ou ajuste testes.
Ao final, resuma o que mudou e o que foi validado.
```

### Nova feature

```text
Leia AGENTS.md e os arquivos já existentes da feature.
Siga os padrões da codebase.
Implemente a feature sem inventar uma arquitetura paralela.
Atualize documentação se isso virar padrão recorrente.
```

### Review de branch ou diff

```text
Faça review com foco em bugs, regressões, segurança, violações de arquitetura e testes faltando.
Quero findings objetivos, com severidade e arquivos afetados.
```

### Planejamento

```text
Leia o contexto atual do projeto.
Me proponha um plano enxuto para implementar essa feature dentro dos padrões atuais.
Só depois da minha confirmação você altera código.
```

---

## Fluxo recomendado de trabalho

1. Mantenha `AGENTS.md` sempre atualizado
2. Crie playbooks curtos em `ai-docs/` para tarefas recorrentes
3. Sempre que possível, peça análise + implementação + validação no mesmo pedido
4. Quando a mudança for grande, peça primeiro arquitetura ou plano
5. Quando uma boa prática se repetir, transforme em documentação persistente

---

## Sugestões de próximos playbooks

- `ai-docs/backend-endpoint-workflow.md`
- `ai-docs/frontend-feature-workflow.md`
- `ai-docs/review-checklist.md`
- `ai-docs/test-strategy.md`
- `ai-docs/supabase-rls-workflow.md`

Os outros arquivos já existentes em `ai-docs/` continuam úteis como contexto técnico do produto e da stack.
