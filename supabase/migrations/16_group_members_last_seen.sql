-- Add last_seen_at to track when user last viewed a group
ALTER TABLE group_members
ADD COLUMN last_seen_at TIMESTAMPTZ DEFAULT now();

-- Allow users to update their own last_seen_at
CREATE POLICY "group_members_update_own_last_seen"
ON group_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
