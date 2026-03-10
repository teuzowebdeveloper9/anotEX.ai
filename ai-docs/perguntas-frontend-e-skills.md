# anotEX.ai — Ideias de Features e Melhorias de Frontend

## Melhorias de UI (o que já existe mas pode melhorar)

### 1. DashboardPage — lista de gravações é plana e sem contexto
- **Hoje:** `AudioCard` em lista simples
- **Melhoria:** agrupar por data ("Hoje", "Esta semana", "Mês passado"), mostrar preview do título da transcrição diretamente no card quando status COMPLETED, barra de progresso inline enquanto processa

### 2. TranscriptionPage — atalhos de teclado invisíveis
- O `FlashcardDeck` já tem atalhos (setas + espaço) mas o usuário não descobre
- Mostrar hint de teclado visível nas tabs (`1` `2` `3` `4`)
- Botão de "voltar" mais evidente (hoje só tem o Sidebar)

### 3. RecordPage — sem feedback de tamanho do arquivo
- Mostrar barra de progresso de tamanho do arquivo enquanto grava (em direção ao limite de 100MB)
- Feedback visual mais claro do estado de upload após gravação

### 4. Páginas de lista sem busca (Transcriptions, Summaries, Mindmaps, Flashcards)
- Um `<input>` de busca local que filtra o array em memória
- Zero backend, ~30 linhas de código, impacto imediato na UX

---

## Novas Features (ordenadas por impacto vs esforço)

### Prioridade Alta — fácil de implementar

#### 1. Quiz page — `/quiz`
- O backend **já gera o quiz automaticamente**, só falta a UI
- Página com perguntas de múltipla escolha, pontuação no final, feedback por questão
- Dados já existem em `study_materials` com `type = 'quiz'`

#### 2. Busca global com `Ctrl+K`
- Modal de busca que filtra títulos e previews de todas as transcrições já carregadas
- Frontend-only, zero backend extra, zero custo

#### 3. Player de áudio inline
- Botão de play nos `AudioCard` do Dashboard que toca o áudio direto ali
- Usa URL assinada do R2 (backend já suporta) + `<audio>` nativo do browser
- Hoje não tem como reouvir o áudio após upload — gap de UX

### Prioridade Média — vale muito

#### 4. Spaced repetition nos flashcards
- Implementar algoritmo SM-2 no frontend (puro JS, zero API)
- Usuário marca "Fácil / Difícil / Não sabia" em cada card
- Sistema agenda próxima revisão automaticamente
- Progresso salvo no `localStorage` ou coluna extra no Supabase

#### 5. Export do resumo como PDF
- Botão "Exportar" na TranscriptionPage
- Lib `html2pdf.js` ou `jspdf` roda no browser, sem backend extra
- Zero custo, feature que usuário vai usar toda hora

#### 6. Tags nas gravações
- Campo de tags no RecordPage (ex: "Cálculo", "Direito Penal", "Bioquímica")
- Filtro por tag no Dashboard
- Uma coluna `tags text[]` no Supabase + componente de multi-select

### Prioridade Baixa — interessante mas mais trabalho

#### 7. Highlight de trecho + pedir explicação
- Usuário seleciona trecho da transcrição e clica "Explicar"
- 1 chamada Groq com o trecho selecionado como contexto
- Custa ~1 req Groq por clique — dentro do free tier

#### 8. Contador de estudo na sidebar
- "X flashcards revisados hoje", "Y horas transcritas"
- Dados já estão no Supabase, só precisa de query + exibição

#### 9. Share público de resumo
- Link público de leitura apenas (sem auth)
- 1 coluna `is_public boolean` no Supabase + policy pública de SELECT
- URL: `/share/:transcriptionId`

---

## Sobre Skills no Claude Code

O Claude Code tem **Custom Slash Commands** — prompts reutilizáveis criados por você.

### Como criar

```bash
# Skill do projeto (vai para o repo, time todo usa)
mkdir -p .claude/commands
nano .claude/commands/nome.md

# Skill pessoal (disponível em todos os projetos)
mkdir -p ~/.claude/commands
nano ~/.claude/commands/nome.md
```

O arquivo `.md` vira o prompt base. Use `$ARGUMENTS` para o que você passar ao chamar.

### Exemplo de skill útil para este projeto

```markdown
# .claude/commands/new-feature.md

Implemente a seguinte feature no anotEX.ai: $ARGUMENTS

Regras:
- Arquitetura FSD (app → pages → widgets → features → entities → shared)
- Dark theme: bg-base #080a0f, accent indigo #6366f1
- Zero emojis — ícones via Lucide React
- TypeScript strict, sem `any`
- Arquivos em kebab-case
```

Uso: `/new-feature adicionar busca global com Ctrl+K`

### Skills built-in

| Skill | O que faz |
|---|---|
| `/commit` | Commit com Conventional Commits |
| `/review-pr 123` | Revisa PR do GitHub |
| `/simplify` | Refatora código alterado para ser mais simples |
