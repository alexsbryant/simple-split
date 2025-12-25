-- Step 2: Enable RLS on groups table + SELECT policy (membership-based)
-- Run this in Supabase SQL Editor, then test the app still works

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Users can read groups they are members of OR groups they created
-- (created_by check allows INSERT...RETURNING to work before membership is added)
CREATE POLICY "groups_select_members"
ON groups FOR SELECT
TO authenticated
USING (
  id IN (SELECT get_user_group_ids(auth.uid()))
  OR created_by = auth.uid()
);
