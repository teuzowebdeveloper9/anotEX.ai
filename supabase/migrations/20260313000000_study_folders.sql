-- Pastas de estudo
CREATE TABLE study_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  item_count INTEGER NOT NULL DEFAULT 0,
  recommendations_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Itens dentro das pastas (referências, sem duplicar dados)
CREATE TABLE study_folder_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES study_folders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcription_id UUID NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('SUMMARY', 'TRANSCRIPTION', 'FLASHCARDS', 'MINDMAP')),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (folder_id, transcription_id, item_type)
);

-- RLS
ALTER TABLE study_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_folder_items ENABLE ROW LEVEL SECURITY;

-- Policies: study_folders
CREATE POLICY "users_select_own_folders"
  ON study_folders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_folders"
  ON study_folders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_folders"
  ON study_folders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_folders"
  ON study_folders FOR DELETE USING (auth.uid() = user_id);

-- Policies: study_folder_items
CREATE POLICY "users_select_own_folder_items"
  ON study_folder_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_folder_items"
  ON study_folder_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_folder_items"
  ON study_folder_items FOR DELETE USING (auth.uid() = user_id);

-- Índices para RLS e performance
CREATE INDEX idx_study_folders_user_id ON study_folders(user_id);
CREATE INDEX idx_study_folder_items_folder_id ON study_folder_items(folder_id);
CREATE INDEX idx_study_folder_items_user_id ON study_folder_items(user_id);
CREATE INDEX idx_study_folder_items_transcription_id ON study_folder_items(transcription_id);
