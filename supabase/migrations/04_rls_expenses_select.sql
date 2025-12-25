-- Step 4: Enable RLS on expenses table + SELECT policy
-- Run this in Supabase SQL Editor, then test the app still works
-- Note: Uses get_user_group_ids() function created in step 3

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Users can only read expenses in groups they belong to
CREATE POLICY "expenses_select_members"
ON expenses FOR SELECT
TO authenticated
USING (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
);
