-- Phase 9B: Group Deletion
-- Allow only the group creator to delete their group

-- Delete policy: only creator can delete
CREATE POLICY "groups_delete_creator"
ON groups FOR DELETE
TO authenticated
USING (created_by = auth.uid());
