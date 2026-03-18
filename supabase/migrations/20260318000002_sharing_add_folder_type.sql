-- Adiciona 'study_folder' como resource_type válido
ALTER TABLE shared_links
  DROP CONSTRAINT IF EXISTS shared_links_resource_type_check;

ALTER TABLE shared_links
  ADD CONSTRAINT shared_links_resource_type_check
  CHECK (resource_type IN ('transcription', 'audio', 'study_material', 'study_folder'));
