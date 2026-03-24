-- Migration: Spaced Repetition (SM-2)
-- Tabela de histórico de revisões de flashcards

CREATE TABLE flashcard_reviews (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_material_id UUID   NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  flashcard_index SMALLINT NOT NULL,
  quality      SMALLINT    NOT NULL CHECK (quality BETWEEN 0 AND 5),
  reviewed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS obrigatório
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_flashcard_reviews"
ON flashcard_reviews FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_flashcard_reviews"
ON flashcard_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Índices para RLS e queries
CREATE INDEX idx_flashcard_reviews_user_id ON flashcard_reviews(user_id);
CREATE INDEX idx_flashcard_reviews_study_material_id ON flashcard_reviews(study_material_id);
