-- Create expense_comments table for comments on expenses
-- Users can comment on expenses in groups they belong to

CREATE TABLE expense_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient lookups by expense (ordered by time for display)
CREATE INDEX idx_expense_comments_expense_id ON expense_comments(expense_id, created_at);

-- Enable RLS
ALTER TABLE expense_comments ENABLE ROW LEVEL SECURITY;

-- Select: group members can read comments for expenses in their groups
CREATE POLICY "expense_comments_select" ON expense_comments FOR SELECT TO authenticated
USING (expense_id IN (SELECT id FROM expenses WHERE group_id IN (SELECT get_user_group_ids(auth.uid()))));

-- Insert: group members can add their own comments
CREATE POLICY "expense_comments_insert" ON expense_comments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND expense_id IN (SELECT id FROM expenses WHERE group_id IN (SELECT get_user_group_ids(auth.uid()))));

-- Delete: users can remove their own comments
CREATE POLICY "expense_comments_delete" ON expense_comments FOR DELETE TO authenticated
USING (user_id = auth.uid());
