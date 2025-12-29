-- Phase 9C: Restrict invitations to group creators only

-- Drop existing insert policy
DROP POLICY IF EXISTS "invitations_insert" ON group_invitations;

-- Create new policy: Only group creators can invite
CREATE POLICY "invitations_insert_creator_only" ON group_invitations
FOR INSERT
WITH CHECK (
  invited_by_user_id = auth.uid()
  AND group_id IN (
    SELECT id FROM groups
    WHERE created_by = auth.uid()
  )
);
