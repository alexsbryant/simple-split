-- Step 6: Add INSERT policy for group_members
-- Run this in Supabase SQL Editor, then test creating a new group (which adds creator as member)

-- Users can only add themselves to groups
-- (This allows the group creation flow where creator adds themselves)
CREATE POLICY "group_members_insert_self"
ON group_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
