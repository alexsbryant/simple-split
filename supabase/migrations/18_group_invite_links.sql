-- Migration: Create group_invite_links table for shareable invite URLs
-- This table is separate from group_invitations to avoid conflicts with the
-- existing (group_id, invited_email) unique constraint on pending invites.

CREATE TABLE group_invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast token lookups (primary use case)
CREATE INDEX idx_invite_links_token ON group_invite_links(token);

-- One active invite link per group
-- Revoking/regenerating deletes the old row, fully invalidating the old token
CREATE UNIQUE INDEX idx_invite_links_one_per_group ON group_invite_links(group_id);
