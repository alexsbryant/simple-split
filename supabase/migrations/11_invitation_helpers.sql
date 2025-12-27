-- Helper functions to get invitation details (bypasses RLS for invited users)

-- Get group name for an invitation
CREATE OR REPLACE FUNCTION get_invitation_group_name(invitation_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.name
  FROM groups g
  JOIN group_invitations gi ON gi.group_id = g.id
  WHERE gi.id = invitation_id
  LIMIT 1;
$$;

-- Get inviter display name for an invitation
CREATE OR REPLACE FUNCTION get_invitation_inviter_name(invitation_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.display_name
  FROM users u
  JOIN group_invitations gi ON gi.invited_by_user_id = u.id
  WHERE gi.id = invitation_id
  LIMIT 1;
$$;

-- Combined function to get invitation details
CREATE OR REPLACE FUNCTION get_invitation_details(user_email TEXT)
RETURNS TABLE (
  id UUID,
  group_id UUID,
  group_name TEXT,
  inviter_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    gi.id,
    gi.group_id,
    g.name as group_name,
    u.display_name as inviter_name,
    gi.created_at
  FROM group_invitations gi
  JOIN groups g ON g.id = gi.group_id
  JOIN users u ON u.id = gi.invited_by_user_id
  WHERE gi.invited_email = LOWER(user_email)
    AND gi.status = 'pending'
  ORDER BY gi.created_at DESC;
$$;
