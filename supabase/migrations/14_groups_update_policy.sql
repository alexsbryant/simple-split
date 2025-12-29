-- Phase 10A: Group Renaming
-- Allow only the group creator to update group name

-- Update policy: only creator can update
CREATE POLICY "groups_update_creator"
ON groups FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());
