# Perguntas — IA para Frontend e Skills do Claude Code

## 1. Tem IA que ajuda a melhorar o front e pensar em novas features?

Sim — várias. Aqui estão as mais relevantes para o teu contexto (React + Tailwind, custo zero/baixo):

### Para gerar/melhorar UI visualmente

| Ferramenta | O que faz | Custo |
|---|---|---|
| **v0.dev** (Vercel) | Gera componentes React + Tailwind a partir de prompt ou screenshot | Gratuito (limite mensal) |
| **Lovable.dev** | Gera app inteiro a partir de prompt, edita via chat | Gratuito com limite |
| **Bolt.new** (StackBlitz) | Full-stack app generation, edita em tempo real | Gratuito com limite |
| **Cursor** | IDE com IA integrada, contexto do codebase inteiro | $20/mês (vale muito) |
| **GitHub Copilot** | Autocomplete inteligente no VSCode | $10/mês |

**Recomendação prática:** usa **v0.dev** para gerar componentes novos (ex: "crie um flashcard deck animado dark theme indigo") e cola no projeto. É o fluxo mais rápido para iterar na UI sem sair do teu stack.

---

### Para ideação de features baratas

A melhor abordagem é usar o próprio Claude (ou GPT-4o) com contexto do projeto. Algumas features interessantes que cabem no teu tier gratuito atual:

#### Features de alto impacto, custo zero (só Groq free tier)

1. **Busca semântica nas transcrições** — embeddings locais (transformers.js no frontend, roda no browser, zero custo de API)
2. **Export para PDF/Notion** — resumo + flashcards formatados para exportar
3. **Timer de estudo (Pomodoro)** — com sessão vinculada a uma anotação específica
4. **Tags e categorias** — organizar gravações por disciplina/matéria
5. **Highlights de trecho** — usuário seleciona trecho da transcrição e pede explicação (1 chamada Groq)
6. **Modo de revisão de flashcards com spaced repetition** — algoritmo SM-2 implementado no frontend, zero backend extra
7. **Share público de resumo** — link público de leitura apenas (1 coluna no Supabase + policy pública)

#### Features que custam um pouco mas valem

| Feature | Custo estimado |
|---|---|
| Text-to-speech do resumo (ElevenLabs) | ~$0.03/1k chars |
| Tradução automática (DeepL) | Gratuito até 500k chars/mês |
| OCR de slides/PDFs (pdf-parse local) | Zero |

---

## 2. Dá para dar skills (habilidades) ao Claude Code?

**Sim!** O Claude Code tem um sistema de **Custom Slash Commands** — são prompts reutilizáveis que você cria e chama com `/nome-do-comando`.

### Como criar uma skill

**Opção A — Skill pessoal (disponível em todos os projetos):**
```bash
mkdir -p ~/.claude/commands
# cria um arquivo .md com o prompt
nano ~/.claude/commands/minha-skill.md
```

**Opção B — Skill do projeto (commitada no repo, compartilhada com o time):**
```bash
mkdir -p .claude/commands
nano .claude/commands/minha-skill.md
```

### Exemplo: criar uma skill `/new-feature`

```markdown
# .claude/commands/new-feature.md

Você é um especialista em React + FSD + Tailwind.
Analise o codebase do anotEX.ai e implemente a feature: $ARGUMENTS

Siga:
- Arquitetura FSD (app → pages → widgets → features → entities → shared)
- Dark theme (bg-base #080a0f, accent indigo #6366f1)
- Zero emojis, ícones via Lucide React
- TypeScript strict, sem `any`
- Nomeie arquivos em kebab-case
```

Uso: `/new-feature adicionar busca por transcrições`

### Exemplo: skill `/review-frontend`

```markdown
# .claude/commands/review-frontend.md

Revise o frontend do anotEX.ai com foco em:
1. Quebras na regra de importação FSD
2. Uso de `any` no TypeScript
3. Emojis na UI (não permitido — usar Lucide React)
4. Componentes sem acessibilidade básica (aria-label, role)
5. Performance: lazy loading em páginas pesadas

Reporte cada problema com: arquivo, linha, problema, sugestão.
```

### Skills built-in disponíveis agora

O Claude Code já vem com skills prontas que você pode usar:

| Skill | Como chamar | O que faz |
|---|---|---|
| `/commit` | `/commit` | Cria commit com Conventional Commits |
| `/review-pr` | `/review-pr 123` | Revisa um PR do GitHub |
| `/simplify` | `/simplify` | Refatora código alterado para simplicidade |

---

## Resumo

- **Para melhorar UI:** v0.dev (gera componentes) + Cursor (IDE com IA no contexto)
- **Para novas features:** spaced repetition, busca semântica, export PDF, tags — todas viáveis no free tier
- **Para dar skills ao Claude:** cria arquivos `.md` em `.claude/commands/` no projeto ou `~/.claude/commands/` globalmente
