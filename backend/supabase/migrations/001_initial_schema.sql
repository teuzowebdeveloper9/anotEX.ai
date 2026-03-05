-- ============================================================
-- anotEX.ai - Schema inicial
-- ============================================================

-- Tabela de áudios
CREATE TABLE IF NOT EXISTS audios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name     TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    BIGINT NOT NULL,
  storage_key   TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de transcrições
CREATE TABLE IF NOT EXISTS transcriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id            UUID NOT NULL REFERENCES audios(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcription_text  TEXT,
  summary_text        TEXT,
  language            TEXT NOT NULL DEFAULT 'pt',
  status              TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Índices (desempenho e RLS)
-- ============================================================

CREATE INDEX idx_audios_user_id ON audios(user_id);
CREATE INDEX idx_audios_status ON audios(status);
CREATE INDEX idx_transcriptions_user_id ON transcriptions(user_id);
CREATE INDEX idx_transcriptions_audio_id ON transcriptions(audio_id);
CREATE INDEX idx_transcriptions_status ON transcriptions(status);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para audios
CREATE POLICY "users_select_own_audios"
  ON audios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_audios"
  ON audios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_audios"
  ON audios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_audios"
  ON audios FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para transcriptions
CREATE POLICY "users_select_own_transcriptions"
  ON transcriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_transcriptions"
  ON transcriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_transcriptions"
  ON transcriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_transcriptions"
  ON transcriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Service role bypass (para o backend com service_role_key)
-- O service role key ignora RLS por padrão no Supabase.
-- As políticas acima protegem o acesso via anon/user keys.
-- ============================================================
