-- Migration: RLS policies for group_invite_links
-- Only group creators can manage invite links for their groups.

ALTER TABLE group_invite_links ENABLE ROW LEVEL SECURITY;

-- SELECT: Group creators can view their invite links
CREATE POLICY "invite_links_select" ON group_invite_links FOR SELECT USING (
  group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
);

-- INSERT: Only group creators can create invite links for their groups
CREATE POLICY "invite_links_insert" ON group_invite_links FOR INSERT WITH CHECK (
  created_by_user_id = auth.uid()
  AND group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
);

-- DELETE: Group creators can delete/revoke their invite links
CREATE POLICY "invite_links_delete" ON group_invite_links FOR DELETE USING (
  group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
);
