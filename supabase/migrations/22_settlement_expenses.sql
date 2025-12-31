-- Add settlement support to expenses table
-- Settlements are special expenses that record debt payments between users

-- Add is_settlement flag to mark settlement expenses
ALTER TABLE expenses ADD COLUMN is_settlement BOOLEAN NOT NULL DEFAULT FALSE;

-- Add settled_with_user_id to track who received the settlement payment
-- NULL for regular expenses, populated for settlements
ALTER TABLE expenses ADD COLUMN settled_with_user_id UUID REFERENCES users(id);

-- Index for efficient filtering of settlements
CREATE INDEX idx_expenses_is_settlement ON expenses(group_id, is_settlement);

-- Constraint: settled_with_user_id must be set if is_settlement is true
ALTER TABLE expenses ADD CONSTRAINT settlement_requires_recipient
  CHECK (
    (is_settlement = FALSE AND settled_with_user_id IS NULL) OR
    (is_settlement = TRUE AND settled_with_user_id IS NOT NULL)
  );

-- Constraint: cannot settle with yourself
ALTER TABLE expenses ADD CONSTRAINT settlement_different_users
  CHECK (
    is_settlement = FALSE OR paid_by_user_id != settled_with_user_id
  );
