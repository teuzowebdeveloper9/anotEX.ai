-- shared_links: permite compartilhar qualquer recurso via token público
CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('transcription', 'audio', 'study_material')),
  resource_id UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, resource_type, resource_id)
);

ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_shared_links"
  ON shared_links FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "users_manage_own_shared_links"
  ON shared_links FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_shared_links_owner_id ON shared_links(owner_id);
CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_shared_links_resource ON shared_links(resource_type, resource_id);

-- Função para buscar user_id por email (usado no backend para add membro de grupo)
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT id FROM auth.users WHERE email = user_email LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO service_role;
