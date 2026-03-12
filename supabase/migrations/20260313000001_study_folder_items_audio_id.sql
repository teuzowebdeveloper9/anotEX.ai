-- Remove itens antigos que não têm audio_id (dados inválidos sem essa coluna)
DELETE FROM study_folder_items;

-- Adiciona a coluna com NOT NULL
ALTER TABLE study_folder_items
  ADD COLUMN audio_id UUID NOT NULL REFERENCES audios(id) ON DELETE CASCADE;

CREATE INDEX idx_study_folder_items_audio_id ON study_folder_items(audio_id);
