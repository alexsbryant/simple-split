-- Step 7: Add INSERT/UPDATE/DELETE policies for expenses
-- Run this in Supabase SQL Editor, then test expense CRUD operations
-- Note: Uses get_user_group_ids() function created in step 3

-- Users can create expenses in groups they belong to
CREATE POLICY "expenses_insert_members"
ON expenses FOR INSERT
TO authenticated
WITH CHECK (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
);

-- Users can update expenses in groups they belong to (no ownership check)
CREATE POLICY "expenses_update_members"
ON expenses FOR UPDATE
TO authenticated
USING (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
)
WITH CHECK (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
);

-- Users can delete expenses in groups they belong to (no ownership check)
CREATE POLICY "expenses_delete_members"
ON expenses FOR DELETE
TO authenticated
USING (
  group_id IN (SELECT get_user_group_ids(auth.uid()))
);
