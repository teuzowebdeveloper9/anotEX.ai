# Checklist para Colocar as Pastas de Estudo no Ar

## 1. YouTube Data API v3 — Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto (ou use o existente)
3. Vá em **APIs & Services → Library**
4. Busque **YouTube Data API v3** e clique em **Enable**
5. Vá em **APIs & Services → Credentials → Create Credentials → API Key**
6. Copie a chave gerada — você vai precisar dela no passo 2

> Cota gratuita: 10.000 unidades/dia. Cada busca consome 100 unidades = 100 buscas/dia no gratuito.

---

## 2. Railway — adicionar variável de ambiente

No dashboard do Railway, no serviço da **API** (e no serviço **Worker**, se existir):

```
YOUTUBE_API_KEY=sua_chave_aqui
```

> Sem essa variável o backend não sobe (validação Joi no startup vai rejeitar).

---

## 3. Supabase — rodar a migration

No dashboard do Supabase, vá em **SQL Editor** e cole o conteúdo do arquivo:

```
supabase/migrations/20260313000000_study_folders.sql
```

Isso cria:
- Tabela `study_folders`
- Tabela `study_folder_items`
- RLS habilitado em ambas com policies completas
- Índices de performance

> Se você usa Supabase CLI: `supabase db push`

---

## 4. Deploy do Backend

O Railway faz deploy automático ao dar push no `main`. Basta:

```bash
git add .
git commit -m "feat(study-folders): add study folders feature with YouTube recommendations"
git push origin main
```

Verifique os logs no Railway para confirmar que o serviço subiu sem erros.

---

## 5. Deploy do Frontend (Cloudflare Workers)

```bash
cd frontend
npm run build
npx wrangler deploy --assets dist
```

> Lembre do `--assets dist` — sem ele o wrangler lê o projeto inteiro.

---

## 6. Verificar se está funcionando

- [ ] Acesse o app e veja "Pastas de Estudo" na sidebar
- [ ] Crie uma pasta
- [ ] Adicione 5 materiais a ela
- [ ] A barra de progresso deve chegar a 100% e aparecer o botão "Buscar Recomendações"
- [ ] Clique no botão — deve aparecer 5 cards de vídeo
- [ ] Clique em um vídeo — deve abrir o player do YouTube embutido na tela

---

## Resumo rápido

| O que fazer | Onde | Tempo estimado |
|---|---|---|
| Ativar YouTube API v3 e gerar chave | Google Cloud Console | 3 min |
| Adicionar `YOUTUBE_API_KEY` | Railway → Variables | 1 min |
| Rodar a migration SQL | Supabase SQL Editor | 1 min |
| Push para o main | Terminal | 1 min |
| Build + deploy frontend | Terminal | 2 min |
