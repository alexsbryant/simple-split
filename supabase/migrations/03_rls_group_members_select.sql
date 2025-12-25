-- Step 3: Enable RLS on group_members table + SELECT policy
-- Run this in Supabase SQL Editor, then test the app still works

-- First, create a helper function that bypasses RLS to get user's group IDs
-- This avoids the circular dependency where group_members policy queries group_members
CREATE OR REPLACE FUNCTION get_user_group_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id FROM group_members WHERE user_id = uid;
$$;

-- Enable RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Users can only read memberships for groups they belong to
CREATE POLICY "group_members_select"
ON group_members FOR SELECT
TO authenticated
USING (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
);
