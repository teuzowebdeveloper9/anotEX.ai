-- =============================================================================
-- anotEX.ai — Schema consolidado para Azure Database for PostgreSQL
-- Flexible Server (PostgreSQL 16, banco `anotex`)
--
-- Gerado a partir das migrations em supabase/migrations/ (estado final),
-- adaptado para Postgres puro — SEM dependências do Supabase:
--   - Sem schema `auth` (tabela public.users própria)
--   - Sem RLS / policies / auth.uid() / roles anon|authenticated|service_role
--   - Auth própria: magic_link_tokens + refresh_tokens
--   - pg_cron opcional (agendado apenas se a extensão estiver disponível)
--
-- Aplicação (banco vazio, execução única e atômica):
--   psql "$AZURE_PG_URL" -1 -v ON_ERROR_STOP=1 -f infra/azure-postgres-schema.sql
--
-- Observações:
--   - IDs de usuários serão IMPORTADOS do Supabase (INSERT com id explícito).
--   - A tabela pending_registrations do snapshot foi omitida (não usada pelo código).
-- =============================================================================


-- =============================================================================
-- 1. EXTENSÕES
-- =============================================================================

-- gen_random_uuid() é nativo no PG16; pgcrypto é necessário para
-- gen_random_bytes() (default do token de shared_links).
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =============================================================================
-- 2. USUÁRIOS E AUTENTICAÇÃO PRÓPRIA
-- =============================================================================

-- Substitui auth.users do Supabase. IDs vêm importados do Supabase
-- (INSERT com id explícito) — por isso uuid com DEFAULT, nunca IDENTITY.
CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL,
  password_hash TEXT        NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uidx_users_email_lower ON users (lower(email));

-- Tokens de magic link (login sem senha)
CREATE TABLE magic_link_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_magic_link_tokens_user_id    ON magic_link_tokens (user_id);
CREATE INDEX idx_magic_link_tokens_expires_at ON magic_link_tokens (expires_at);

-- Refresh tokens da sessão
CREATE TABLE refresh_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);


-- =============================================================================
-- 3. TABELAS DE DOMÍNIO (ordem de dependência)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- audios
-- ---------------------------------------------------------------------------
CREATE TABLE audios (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name     TEXT        NOT NULL,
  mime_type     TEXT        NOT NULL,
  size_bytes    BIGINT      NOT NULL,
  storage_key   TEXT        NOT NULL UNIQUE,
  status        TEXT        NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- transcriptions (inclui title e segments — estado final)
-- ---------------------------------------------------------------------------
CREATE TABLE transcriptions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id           UUID        NOT NULL REFERENCES audios(id) ON DELETE CASCADE,
  user_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transcription_text TEXT,
  summary_text       TEXT,
  language           TEXT        NOT NULL DEFAULT 'pt',
  status             TEXT        NOT NULL DEFAULT 'PENDING'
                                 CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  error_message      TEXT,
  title              TEXT,
  -- Cada segmento: { start: number, end: number, text: string }
  segments           JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- study_materials (flashcards, mindmap, quiz gerados por IA)
-- ---------------------------------------------------------------------------
CREATE TABLE study_materials (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID        NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             TEXT        NOT NULL CHECK (type IN ('flashcards', 'mindmap', 'quiz')),
  status           TEXT        NOT NULL DEFAULT 'PENDING'
                               CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  content          JSONB,
  error_message    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- study_folders (pastas de estudo)
-- ---------------------------------------------------------------------------
CREATE TABLE study_folders (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                     TEXT        NOT NULL,
  description              TEXT,
  item_count               INTEGER     NOT NULL DEFAULT 0,
  recommendations_unlocked BOOLEAN     NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- study_folder_items (itens das pastas — inclui audio_id e tipo QUIZ, estado final)
-- ---------------------------------------------------------------------------
CREATE TABLE study_folder_items (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id        UUID        NOT NULL REFERENCES study_folders(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transcription_id UUID        NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  audio_id         UUID        NOT NULL REFERENCES audios(id) ON DELETE CASCADE,
  item_type        TEXT        NOT NULL,
  title            TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT study_folder_items_item_type_check
    CHECK (item_type IN ('SUMMARY', 'TRANSCRIPTION', 'FLASHCARDS', 'MINDMAP', 'QUIZ')),
  UNIQUE (folder_id, transcription_id, item_type)
);

-- ---------------------------------------------------------------------------
-- shared_links (compartilhamento por token público — inclui study_folder, estado final)
-- ---------------------------------------------------------------------------
CREATE TABLE shared_links (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token         TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  owner_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type TEXT        NOT NULL,
  resource_id   UUID        NOT NULL,
  is_public     BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT shared_links_resource_type_check
    CHECK (resource_type IN ('transcription', 'audio', 'study_material', 'study_folder')),
  UNIQUE (owner_id, resource_type, resource_id)
);

-- ---------------------------------------------------------------------------
-- study_groups (grupos de estudo colaborativos)
-- ---------------------------------------------------------------------------
CREATE TABLE study_groups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  owner_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- study_group_members
-- ---------------------------------------------------------------------------
CREATE TABLE study_group_members (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  UUID        NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- ---------------------------------------------------------------------------
-- study_group_shares (shared_links compartilhados em um grupo)
-- ---------------------------------------------------------------------------
CREATE TABLE study_group_shares (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id       UUID        NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  shared_link_id UUID        NOT NULL REFERENCES shared_links(id) ON DELETE CASCADE,
  shared_by      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, shared_link_id)
);

-- ---------------------------------------------------------------------------
-- chat_messages ("Chat com a Aula")
-- ---------------------------------------------------------------------------
CREATE TABLE chat_messages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID        NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role             TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- flashcard_reviews (spaced repetition SM-2)
-- ---------------------------------------------------------------------------
CREATE TABLE flashcard_reviews (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  study_material_id UUID        NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  flashcard_index   SMALLINT    NOT NULL,
  quality           SMALLINT    NOT NULL CHECK (quality BETWEEN 0 AND 5),
  reviewed_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- user_subscriptions (AbacatePay)
-- ---------------------------------------------------------------------------
CREATE TABLE user_subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  customer_name          TEXT        NOT NULL,
  customer_email         TEXT        NOT NULL,
  customer_cellphone     TEXT        NOT NULL,
  customer_tax_id        TEXT        NOT NULL,
  abacatepay_customer_id TEXT,
  abacatepay_billing_id  TEXT,
  status                 TEXT        NOT NULL DEFAULT 'pending',
  plan_id                TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- pomodoro_settings
-- ---------------------------------------------------------------------------
CREATE TABLE pomodoro_settings (
  user_id                  UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  focus_duration_minutes   SMALLINT    NOT NULL DEFAULT 25,
  short_break_minutes      SMALLINT    NOT NULL DEFAULT 5,
  long_break_minutes       SMALLINT    NOT NULL DEFAULT 15,
  long_break_interval      SMALLINT    NOT NULL DEFAULT 4,
  auto_start_breaks        BOOLEAN     NOT NULL DEFAULT true,
  auto_start_focus         BOOLEAN     NOT NULL DEFAULT false,
  daily_focus_goal_minutes SMALLINT    NOT NULL DEFAULT 100,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- pomodoro_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE pomodoro_sessions (
  id                           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status                       TEXT        NOT NULL
    CHECK (status IN ('running', 'paused', 'awaiting_next_phase', 'stopped', 'completed', 'abandoned')),
  current_phase_type           TEXT        NOT NULL
    CHECK (current_phase_type IN ('focus', 'short_break', 'long_break')),
  current_cycle_sequence       INTEGER     NOT NULL DEFAULT 1,
  completed_focus_cycles       INTEGER     NOT NULL DEFAULT 0,
  completed_short_break_cycles INTEGER     NOT NULL DEFAULT 0,
  completed_long_break_cycles  INTEGER     NOT NULL DEFAULT 0,
  focus_duration_minutes       SMALLINT    NOT NULL,
  short_break_minutes          SMALLINT    NOT NULL,
  long_break_minutes           SMALLINT    NOT NULL,
  long_break_interval          SMALLINT    NOT NULL,
  auto_start_breaks            BOOLEAN     NOT NULL,
  auto_start_focus             BOOLEAN     NOT NULL,
  started_at                   TIMESTAMPTZ NOT NULL,
  ended_at                     TIMESTAMPTZ,
  phase_started_at             TIMESTAMPTZ,
  phase_target_ends_at         TIMESTAMPTZ,
  paused_at                    TIMESTAMPTZ,
  current_phase_paused_ms      INTEGER     NOT NULL DEFAULT 0,
  total_paused_ms              INTEGER     NOT NULL DEFAULT 0,
  total_focus_ms               INTEGER     NOT NULL DEFAULT 0,
  total_break_ms               INTEGER     NOT NULL DEFAULT 0,
  context_type                 TEXT
    CHECK (context_type IN ('general', 'review', 'transcription', 'chat', 'study_folder')),
  context_id                   UUID,
  context_label                TEXT,
  version                      INTEGER     NOT NULL DEFAULT 1,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- pomodoro_cycles
-- ---------------------------------------------------------------------------
CREATE TABLE pomodoro_cycles (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id               UUID        NOT NULL REFERENCES pomodoro_sessions(id) ON DELETE CASCADE,
  user_id                  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sequence                 INTEGER     NOT NULL,
  phase_type               TEXT        NOT NULL
    CHECK (phase_type IN ('focus', 'short_break', 'long_break')),
  status                   TEXT        NOT NULL
    CHECK (status IN ('running', 'paused', 'completed', 'stopped', 'skipped', 'abandoned')),
  planned_duration_ms      INTEGER     NOT NULL,
  started_at               TIMESTAMPTZ NOT NULL,
  ended_at                 TIMESTAMPTZ,
  paused_at                TIMESTAMPTZ,
  paused_total_ms          INTEGER     NOT NULL DEFAULT 0,
  effective_duration_ms    INTEGER,
  completed_automatically  BOOLEAN     NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, sequence)
);


-- =============================================================================
-- 4. FUNÇÕES
-- =============================================================================

-- Usada pelo backend (ex.: adicionar membro a grupo de estudo por email).
-- Antes apontava para auth.users; agora resolve em public.users.
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM public.users WHERE lower(email) = lower(user_email) LIMIT 1;
$$;

-- LGPD Art. 15 — Retenção de dados.
-- Deleta audios (e dependentes, via ON DELETE CASCADE) criados há mais de
-- 365 dias com status COMPLETED ou FAILED (nunca PENDING/PROCESSING).
--
-- ATENÇÃO: a deleção dos arquivos no R2 deve ser feita ANTES de chamar esta
-- função — o banco não tem acesso ao storage externo. O backend deve buscar
-- os storage_keys e deletar no R2 primeiro.
--
-- Uso manual ou via cron: SELECT delete_old_user_data();
CREATE OR REPLACE FUNCTION delete_old_user_data()
RETURNS TABLE(deleted_audio_ids UUID[], deleted_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ := now() - INTERVAL '365 days';
  v_deleted_ids UUID[];
  v_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM audios
    WHERE created_at < v_cutoff
      AND status IN ('COMPLETED', 'FAILED')
    RETURNING id
  )
  SELECT array_agg(id), count(*)::INTEGER
  INTO v_deleted_ids, v_count
  FROM deleted;

  RETURN QUERY SELECT
    COALESCE(v_deleted_ids, ARRAY[]::UUID[]),
    COALESCE(v_count, 0);
END;
$$;

-- Só o owner/roles explicitamente autorizadas podem executar
REVOKE ALL ON FUNCTION delete_old_user_data() FROM PUBLIC;

-- Agendamento da retenção via pg_cron (opcional).
-- No Azure Flexible Server, pg_cron precisa estar na allowlist
-- (server parameter azure.extensions) e em shared_preload_libraries.
-- Se indisponível, apenas emite NOTICE — agende externamente
-- (Azure Functions Timer, Railway Cron, etc.): SELECT delete_old_user_data();
DO $cron_setup$
DECLARE
  v_job_count INTEGER := 0;
BEGIN
  BEGIN
    EXECUTE 'CREATE EXTENSION IF NOT EXISTS pg_cron';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron indisponivel (%) — agende delete_old_user_data() externamente.', SQLERRM;
  END;

  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    EXECUTE 'SELECT count(*)::int FROM cron.job WHERE jobname = ''data-retention-monthly'''
      INTO v_job_count;
    IF v_job_count = 0 THEN
      -- Todo dia 1 do mês às 03:00 UTC
      EXECUTE 'SELECT cron.schedule(''data-retention-monthly'', ''0 3 1 * *'', ''SELECT public.delete_old_user_data()'')';
    END IF;
  END IF;
END
$cron_setup$;


-- =============================================================================
-- 5. ÍNDICES RESTANTES (todos os índices das migrations preservados)
-- =============================================================================

-- audios
CREATE INDEX idx_audios_user_id    ON audios (user_id);
CREATE INDEX idx_audios_status     ON audios (status);
CREATE INDEX idx_audios_id_user_id ON audios (id, user_id);

-- transcriptions
CREATE INDEX idx_transcriptions_user_id  ON transcriptions (user_id);
CREATE INDEX idx_transcriptions_audio_id ON transcriptions (audio_id);
CREATE INDEX idx_transcriptions_status   ON transcriptions (status);

-- study_materials
CREATE INDEX idx_study_materials_transcription_id ON study_materials (transcription_id);
CREATE INDEX idx_study_materials_user_id          ON study_materials (user_id);
CREATE INDEX idx_study_materials_type             ON study_materials (transcription_id, type);

-- study_folders / study_folder_items
CREATE INDEX idx_study_folders_user_id                  ON study_folders (user_id);
CREATE INDEX idx_study_folder_items_folder_id           ON study_folder_items (folder_id);
CREATE INDEX idx_study_folder_items_user_id             ON study_folder_items (user_id);
CREATE INDEX idx_study_folder_items_transcription_id    ON study_folder_items (transcription_id);
CREATE INDEX idx_study_folder_items_audio_id            ON study_folder_items (audio_id);

-- shared_links
CREATE INDEX idx_shared_links_owner_id ON shared_links (owner_id);
CREATE INDEX idx_shared_links_token    ON shared_links (token);
CREATE INDEX idx_shared_links_resource ON shared_links (resource_type, resource_id);

-- study_groups / members / shares
CREATE INDEX idx_study_groups_owner_id         ON study_groups (owner_id);
CREATE INDEX idx_study_group_members_group_id  ON study_group_members (group_id);
CREATE INDEX idx_study_group_members_user_id   ON study_group_members (user_id);
CREATE INDEX idx_study_group_shares_group_id   ON study_group_shares (group_id);
CREATE INDEX idx_study_group_shares_link_id    ON study_group_shares (shared_link_id);

-- chat_messages
CREATE INDEX idx_chat_messages_user_id            ON chat_messages (user_id);
CREATE INDEX idx_chat_messages_transcription_id   ON chat_messages (transcription_id);
CREATE INDEX idx_chat_messages_transcription_user ON chat_messages (transcription_id, user_id, created_at DESC);

-- flashcard_reviews
CREATE INDEX idx_flashcard_reviews_user_id           ON flashcard_reviews (user_id);
CREATE INDEX idx_flashcard_reviews_study_material_id ON flashcard_reviews (study_material_id);

-- pomodoro
CREATE INDEX idx_pomodoro_sessions_user_id            ON pomodoro_sessions (user_id);
CREATE INDEX idx_pomodoro_sessions_user_status        ON pomodoro_sessions (user_id, status);
CREATE INDEX idx_pomodoro_sessions_user_started_at    ON pomodoro_sessions (user_id, started_at DESC);
CREATE INDEX idx_pomodoro_cycles_user_id_started_at   ON pomodoro_cycles (user_id, started_at DESC);
CREATE INDEX idx_pomodoro_cycles_session_id_sequence  ON pomodoro_cycles (session_id, sequence);
CREATE UNIQUE INDEX uidx_pomodoro_sessions_one_active_per_user
  ON pomodoro_sessions (user_id)
  WHERE status IN ('running', 'paused', 'awaiting_next_phase');


-- =============================================================================
-- IMPORTAÇÃO DE DADOS (Supabase -> Azure)
-- =============================================================================
-- Este bloco é apenas documentação — nada abaixo é executado.
--
-- 1) USERS — a partir de auth.users do Supabase.
--    Mapeamento: id -> id, email -> email, encrypted_password -> password_hash,
--    created_at -> created_at, updated_at -> updated_at.
--    (O hash do Supabase é bcrypt/GoTrue; se a nova auth for só magic link,
--    password_hash pode ficar NULL.)
--
--    Exportar do Supabase (usar a connection string do banco, não a API):
--      psql "$SUPABASE_DB_URL" -c "\copy (
--        SELECT id, email, encrypted_password, created_at, COALESCE(updated_at, created_at)
--        FROM auth.users WHERE deleted_at IS NULL
--      ) TO 'users.csv' WITH (FORMAT csv)"
--
--    Importar no Azure:
--      psql "$AZURE_PG_URL" -c "\copy users (id, email, password_hash, created_at, updated_at)
--        FROM 'users.csv' WITH (FORMAT csv)"
--
-- 2) TABELAS DE DOMÍNIO — importar com \copy NA MESMA ORDEM DAS FKs
--    (pais antes dos filhos), exatamente a ordem de criação deste arquivo:
--
--      1. audios
--      2. transcriptions
--      3. study_materials
--      4. study_folders
--      5. study_folder_items
--      6. shared_links
--      7. study_groups
--      8. study_group_members
--      9. study_group_shares
--     10. chat_messages
--     11. flashcard_reviews
--     12. user_subscriptions
--     13. pomodoro_settings
--     14. pomodoro_sessions
--     15. pomodoro_cycles
--
--    Para cada tabela (exemplo com audios):
--      psql "$SUPABASE_DB_URL" -c "\copy (SELECT * FROM public.audios) TO 'audios.csv' WITH (FORMAT csv)"
--      psql "$AZURE_PG_URL"    -c "\copy audios FROM 'audios.csv' WITH (FORMAT csv)"
--
--    Alternativa: pg_dump --data-only --no-owner --no-privileges
--      --table=public.audios --table=public.transcriptions ... (todas as 15)
--      do Supabase e aplicar o dump no Azure (o pg_dump já ordena por FK
--      quando todas as tabelas são incluídas; conferir a ordem acima).
--
-- 3) magic_link_tokens e refresh_tokens começam VAZIAS — são da nova auth
--    própria; tokens antigos do Supabase (GoTrue) não são migrados.
--
-- 4) pending_registrations foi intencionalmente omitida (não usada pelo código).
--
-- 5) Pós-import (validação rápida):
--      SELECT count(*) FROM users;
--      SELECT count(*) FROM audios a LEFT JOIN users u ON u.id = a.user_id WHERE u.id IS NULL;  -- deve ser 0
--      ANALYZE;  -- atualiza estatísticas do planner após carga em massa
-- =============================================================================
