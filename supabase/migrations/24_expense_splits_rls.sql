-- RLS policies for expense_splits table
-- Users can manage splits for expenses in groups they belong to

ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

-- Users can read splits for expenses in their groups
CREATE POLICY "expense_splits_select_members"
ON expense_splits FOR SELECT
TO authenticated
USING (
  expense_id IN (
    SELECT id FROM expenses
    WHERE group_id IN (SELECT get_user_group_ids(auth.uid()))
  )
);

-- Users can create splits for expenses in their groups
CREATE POLICY "expense_splits_insert_members"
ON expense_splits FOR INSERT
TO authenticated
WITH CHECK (
  expense_id IN (
    SELECT id FROM expenses
    WHERE group_id IN (SELECT get_user_group_ids(auth.uid()))
  )
);

-- Users can delete splits for expenses in their groups
CREATE POLICY "expense_splits_delete_members"
ON expense_splits FOR DELETE
TO authenticated
USING (
  expense_id IN (
    SELECT id FROM expenses
    WHERE group_id IN (SELECT get_user_group_ids(auth.uid()))
  )
);
