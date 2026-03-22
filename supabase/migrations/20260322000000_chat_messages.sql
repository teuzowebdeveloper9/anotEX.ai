-- Chat messages table for "Chat com a Aula" feature
CREATE TABLE chat_messages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID        NOT NULL REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role             TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_chat_messages"
ON chat_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_chat_messages"
ON chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_chat_messages"
ON chat_messages FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_transcription_id ON chat_messages(transcription_id);
CREATE INDEX idx_chat_messages_transcription_user ON chat_messages(transcription_id, user_id, created_at DESC);
