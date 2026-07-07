# Migração de dados — Supabase/R2 → Azure

> A infra nova sobe **vazia**. Este guia copia os dados de produção (120 usuários) para o Azure.
> Precisa de credenciais que só existem nos dashboards: senha do banco Supabase e keys do R2.

## 1. Banco (Supabase → Azure Postgres)

Pré-requisito: senha do Postgres do Supabase (Dashboard → Project Settings → Database) e a connection string `db.<ref>.supabase.co`.

```bash
# 1. Dump dos dados (só dados, sem schema — o schema novo já foi aplicado no Azure)
pg_dump "postgresql://postgres:<SENHA>@db.<REF>.supabase.co:5432/postgres" \
  --data-only --no-owner --no-privileges \
  -t 'public.audios' -t 'public.transcriptions' -t 'public.chat_messages' \
  -t 'public.study_materials' -t 'public.study_folders' -t 'public.study_folder_items' \
  -t 'public.flashcard_reviews' -t 'public.shared_links' -t 'public.study_groups' \
  -t 'public.study_group_members' -t 'public.study_group_shares' \
  -t 'public.pomodoro_settings' -t 'public.pomodoro_sessions' -t 'public.pomodoro_cycles' \
  -t 'public.user_subscriptions' \
  > dados-dominio.sql

# 2. Usuários: auth.users → public.users (id e hash bcrypt preservados — senhas continuam válidas)
psql "postgresql://postgres:<SENHA>@db.<REF>.supabase.co:5432/postgres" -c \
  "\copy (SELECT id, email, encrypted_password, created_at, COALESCE(updated_at, created_at) FROM auth.users) TO 'users.csv' CSV"

# 3. Importar no Azure (ordem: users primeiro, por causa das FKs)
export AZPG="postgresql://anotex_admin:<SENHA_AZURE>@pg-anotex-f9cf7.postgres.database.azure.com:5432/anotex?sslmode=require"

# 3a. ANTES: remover contas criadas no Azure durante os testes que colidem por email
#     (ex: mateussoftwaredeveloper@gmail.com foi criada nos smoke tests com ID próprio —
#     o import traz a mesma conta com o ID original do Supabase, que é o que os dados referenciam)
psql "$AZPG" -c "DELETE FROM users WHERE lower(email) IN (SELECT lower(email) FROM users); -- ajuste: deletar apenas emails presentes no users.csv"
# forma segura: staging table + delete seletivo
#   CREATE TEMP TABLE users_import (LIKE users);  \copy users_import FROM 'users.csv' CSV
#   DELETE FROM users u USING users_import i WHERE lower(u.email) = lower(i.email);
#   INSERT INTO users SELECT * FROM users_import;

psql "$AZPG" -c "\copy users (id, email, password_hash, created_at, updated_at) FROM 'users.csv' CSV"
psql "$AZPG" -1 -f dados-dominio.sql
```

> A senha admin do Azure Postgres está em `~/.anotex-azure-secrets.env` na máquina de dev.

## 2. Áudios (Cloudflare R2 → Azure Blob)

Pré-requisito: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` (dashboard Cloudflare) e a key do Storage Azure (`az storage account keys list --account-name stanotexf9cf7 -g rg-anotex-prod`).

```bash
# rclone (instalar: curl https://rclone.org/install.sh | sudo bash — ou baixar binário)
rclone config create r2 s3 provider=Cloudflare access_key_id=<R2_KEY> secret_access_key=<R2_SECRET> \
  endpoint=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
rclone config create azblob azureblob account=stanotexf9cf7 key=<STORAGE_KEY>

rclone copy r2:audios-anotex azblob:audios --progress --transfers 8
rclone check r2:audios-anotex azblob:audios   # verificação de integridade
```

## 3. Ordem da virada (cutover)

1. Deploy novo já no ar e testado (API + worker + frontend) — feito pela migração.
2. Congelar uploads (avisar usuários / janela curta de manutenção).
3. Rodar passos 1 e 2 acima.
4. Apontar o domínio final para o Static Web App e a API nova.
5. Manter Supabase/R2 read-only por 7 dias como rollback antes de cancelar.

## Observações

- Hashes de senha do Supabase são bcrypt (`$2a$/$2b$`) — o login novo usa bcryptjs.compare, compatível.
- Usuários de **magic link** não têm senha: continuam entrando por magic link normalmente.
- Sessões antigas (JWTs do Supabase) deixam de valer na virada — todos precisam logar de novo (esperado).
- Assinaturas AbacatePay: atualizar a URL do webhook no dashboard AbacatePay para a API nova.
