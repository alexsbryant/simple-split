-- Create expense_splits table for custom split amounts
-- When an expense has splits, use them instead of equal division

CREATE TABLE expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each user can only have one split per expense
  UNIQUE (expense_id, user_id)
);

-- Index for efficient lookups by expense
CREATE INDEX idx_expense_splits_expense_id ON expense_splits(expense_id);
