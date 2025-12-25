-- Step 5: Add INSERT policy for groups
-- Run this in Supabase SQL Editor, then test creating a new group

-- Any authenticated user can create a group
CREATE POLICY "groups_insert_authenticated"
ON groups FOR INSERT
TO authenticated
WITH CHECK (true);
