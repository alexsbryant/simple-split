-- Phase 9A: RLS policies for group_invitations table

-- Enable RLS
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- SELECT: Group members can see invitations for their groups,
-- OR users can see invitations sent to their email
CREATE POLICY "invitations_select" ON group_invitations FOR SELECT USING (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
  OR invited_email = (SELECT email FROM users WHERE id = auth.uid())
);

-- INSERT: Only group members can create invitations for that group
-- and must set themselves as the inviter
CREATE POLICY "invitations_insert" ON group_invitations FOR INSERT WITH CHECK (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
  AND invited_by_user_id = auth.uid()
);

-- UPDATE: Only the invited user can accept/decline (change status)
CREATE POLICY "invitations_update" ON group_invitations FOR UPDATE USING (
  invited_email = (SELECT email FROM users WHERE id = auth.uid())
);

-- DELETE: Inviter can cancel their own pending invitations
CREATE POLICY "invitations_delete" ON group_invitations FOR DELETE USING (
  invited_by_user_id = auth.uid() AND status = 'pending'
);
