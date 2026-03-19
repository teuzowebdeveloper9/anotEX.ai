ALTER TABLE study_folder_items
  DROP CONSTRAINT IF EXISTS study_folder_items_item_type_check;

ALTER TABLE study_folder_items
  ADD CONSTRAINT study_folder_items_item_type_check
  CHECK (item_type IN ('SUMMARY', 'TRANSCRIPTION', 'FLASHCARDS', 'MINDMAP', 'QUIZ'));
