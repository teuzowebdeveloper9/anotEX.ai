-- study_groups: grupos de estudo colaborativos
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- study_group_members: membros de cada grupo
CREATE TABLE study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- study_group_shares: shared_links compartilhados em um grupo
CREATE TABLE study_group_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  shared_link_id UUID NOT NULL REFERENCES shared_links(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, shared_link_id)
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_shares ENABLE ROW LEVEL SECURITY;

-- Service role bypass
CREATE POLICY "service_role_all_study_groups"
  ON study_groups FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_group_members"
  ON study_group_members FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_group_shares"
  ON study_group_shares FOR ALL USING (auth.role() = 'service_role');

-- Usuários veem grupos que possuem ou são membros
CREATE POLICY "users_view_accessible_groups"
  ON study_groups FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM study_group_members WHERE group_id = id AND user_id = auth.uid())
  );

-- Membros veem outros membros do mesmo grupo
CREATE POLICY "users_view_group_members"
  ON study_group_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = group_id AND m.user_id = auth.uid())
  );

-- Membros veem compartilhamentos do grupo
CREATE POLICY "users_view_group_shares"
  ON study_group_shares FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_group_shares.group_id AND user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_study_groups_owner_id ON study_groups(owner_id);
CREATE INDEX idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX idx_study_group_shares_group_id ON study_group_shares(group_id);
CREATE INDEX idx_study_group_shares_link_id ON study_group_shares(shared_link_id);
