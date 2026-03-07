-- =============================================================================
-- Migration: study_materials table (Fase 2a)
-- Date: 2026-03-07
-- =============================================================================

CREATE TABLE study_materials (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID        NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL,
  type             TEXT        NOT NULL CHECK (type IN ('flashcards', 'mindmap', 'quiz')),
  status           TEXT        NOT NULL DEFAULT 'PENDING'
                               CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  content          JSONB,
  error_message    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados veem apenas seus próprios registros
CREATE POLICY "study_materials_select_own"
  ON study_materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "study_materials_insert_own"
  ON study_materials FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM transcriptions
      WHERE transcriptions.id = transcription_id
        AND transcriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "study_materials_update_own"
  ON study_materials FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_materials_delete_own"
  ON study_materials FOR DELETE
  USING (auth.uid() = user_id);

-- Service role (backend) tem acesso total — necessário para o worker de geração
CREATE POLICY "study_materials_service_role_all"
  ON study_materials FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Índices
CREATE INDEX idx_study_materials_transcription_id ON study_materials (transcription_id);
CREATE INDEX idx_study_materials_user_id          ON study_materials (user_id);
CREATE INDEX idx_study_materials_type             ON study_materials (transcription_id, type);
