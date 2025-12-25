-- Step 1: Enable RLS on users table
-- Run this in Supabase SQL Editor, then test the app still works

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read:
-- 1. Their own profile
-- 2. Profiles of users who share at least one group with them
CREATE POLICY "users_select_self_or_group_members"
ON users FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR
  id IN (
    SELECT gm2.user_id
    FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
  )
);

-- Users can only update their own profile
CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- IMPORTANT: The database trigger handle_new_user runs as SECURITY DEFINER
-- so it bypasses RLS and can still insert new users during signup
