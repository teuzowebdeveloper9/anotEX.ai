-- =============================================================================
-- Migration: Enable RLS on all tables
-- Date: 2026-03-07
-- Description:
--   Habilita Row Level Security nas tabelas `audios` e `transcriptions`.
--
--   IMPORTANTE: O backend usa SUPABASE_SERVICE_ROLE_KEY, que bypassa RLS
--   automaticamente. Essas policies protegem contra acesso direto ao banco
--   via anon key (ex: chamadas diretas ao Supabase fora do backend).
--
--   Regra geral: cada usuário só acessa seus próprios dados (auth.uid() = user_id).
-- =============================================================================


-- =============================================================================
-- TABELA: audios
-- =============================================================================

ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

-- SELECT: usuário vê apenas seus próprios áudios
CREATE POLICY "audios_select_own"
  ON audios
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: usuário só insere com seu próprio user_id
CREATE POLICY "audios_insert_own"
  ON audios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: usuário só atualiza seus próprios áudios
CREATE POLICY "audios_update_own"
  ON audios
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: usuário só deleta seus próprios áudios
CREATE POLICY "audios_delete_own"
  ON audios
  FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================================
-- TABELA: transcriptions
-- =============================================================================

ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: usuário vê apenas suas próprias transcrições
CREATE POLICY "transcriptions_select_own"
  ON transcriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: usuário só insere com seu próprio user_id
--   E o audio_id referenciado deve pertencer ao mesmo usuário
--   (evita que usuário crie transcrição apontando para áudio de outra pessoa)
CREATE POLICY "transcriptions_insert_own"
  ON transcriptions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM audios
      WHERE audios.id = audio_id
        AND audios.user_id = auth.uid()
    )
  );

-- UPDATE: usuário só atualiza suas próprias transcrições
CREATE POLICY "transcriptions_update_own"
  ON transcriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: usuário só deleta suas próprias transcrições
CREATE POLICY "transcriptions_delete_own"
  ON transcriptions
  FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================================
-- ÍNDICES — obrigatórios para performance das policies RLS
-- (sem índice, cada query faz full table scan)
-- =============================================================================

-- audios
CREATE INDEX IF NOT EXISTS idx_audios_user_id
  ON audios (user_id);

-- transcriptions
CREATE INDEX IF NOT EXISTS idx_transcriptions_user_id
  ON transcriptions (user_id);

-- já deve existir por ser FK, mas garante o índice para joins nas policies
CREATE INDEX IF NOT EXISTS idx_transcriptions_audio_id
  ON transcriptions (audio_id);

-- índice composto para a policy de INSERT que faz EXISTS (audio_id + user_id)
CREATE INDEX IF NOT EXISTS idx_audios_id_user_id
  ON audios (id, user_id);
