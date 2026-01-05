-- Create expense_reactions table for emoji reactions on expenses
-- Users can react with multiple different emojis to expenses in groups they belong to

CREATE TABLE expense_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (char_length(emoji) <= 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each user can only have one reaction of each emoji type per expense
  UNIQUE (expense_id, user_id, emoji)
);

-- Index for efficient lookups by expense
CREATE INDEX idx_expense_reactions_expense_id ON expense_reactions(expense_id);

-- Enable RLS
ALTER TABLE expense_reactions ENABLE ROW LEVEL SECURITY;

-- Select: group members can read reactions for expenses in their groups
CREATE POLICY "expense_reactions_select" ON expense_reactions FOR SELECT TO authenticated
USING (expense_id IN (SELECT id FROM expenses WHERE group_id IN (SELECT get_user_group_ids(auth.uid()))));

-- Insert: group members can add their own reactions
CREATE POLICY "expense_reactions_insert" ON expense_reactions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND expense_id IN (SELECT id FROM expenses WHERE group_id IN (SELECT get_user_group_ids(auth.uid()))));

-- Delete: users can remove their own reactions
CREATE POLICY "expense_reactions_delete" ON expense_reactions FOR DELETE TO authenticated
USING (user_id = auth.uid());
