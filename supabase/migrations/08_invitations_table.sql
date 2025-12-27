-- Phase 9A: Create group_invitations table
-- Enables email-based invitations to groups

CREATE TABLE group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  invited_by_user_id UUID NOT NULL REFERENCES users(id),
  invited_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- Index for efficient lookups
CREATE INDEX idx_invitations_group_id ON group_invitations(group_id);
CREATE INDEX idx_invitations_invited_email ON group_invitations(invited_email);
CREATE INDEX idx_invitations_status ON group_invitations(status);

-- Prevent duplicate pending invitations for same email in same group
CREATE UNIQUE INDEX idx_invitations_unique_pending
  ON group_invitations(group_id, invited_email)
  WHERE status = 'pending';
