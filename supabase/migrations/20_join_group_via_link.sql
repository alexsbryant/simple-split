-- Migration: SECURITY DEFINER functions for token-based group joining
--
-- WHY SECURITY DEFINER IS REQUIRED:
-- 1. Users visiting an invite link are not yet group members
-- 2. The group_invite_links table has RLS that only allows group creators to SELECT
-- 3. The group_members INSERT policy requires user_id = auth.uid() (satisfied)
--    but users need to look up the token first to get the group_id
-- 4. These functions provide a narrow, controlled bypass for token validation only


-- Function: join_group_via_link
-- Purpose: Validate an invite token and add the authenticated user to the group
-- Scope: ONLY validates token and inserts into group_members (nothing else)
CREATE OR REPLACE FUNCTION join_group_via_link(invite_token TEXT)
RETURNS TABLE (
  success BOOLEAN,
  group_id UUID,
  group_name TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_group_name TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Not authenticated'::TEXT;
    RETURN;
  END IF;

  -- Look up the invite link and get group info
  SELECT gil.group_id, gil.expires_at, g.name
  INTO v_group_id, v_expires_at, v_group_name
  FROM group_invite_links gil
  JOIN groups g ON g.id = gil.group_id
  WHERE gil.token = invite_token;

  -- Token not found
  IF v_group_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Invalid invite link'::TEXT;
    RETURN;
  END IF;

  -- Token expired
  IF v_expires_at < now() THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Invite link has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if already a member (no-op success)
  IF EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = v_group_id AND gm.user_id = v_user_id) THEN
    RETURN QUERY SELECT TRUE, v_group_id, v_group_name, NULL::TEXT;
    RETURN;
  END IF;

  -- Insert into group_members (this is the only write operation)
  INSERT INTO group_members (group_id, user_id)
  VALUES (v_group_id, v_user_id);

  RETURN QUERY SELECT TRUE, v_group_id, v_group_name, NULL::TEXT;
END;
$$;


-- Function: get_invite_link_info
-- Purpose: Get public info about an invite link for the landing page preview
-- Scope: Read-only, returns only non-sensitive group/inviter display info
-- Used by unauthenticated users to see what group they're being invited to
CREATE OR REPLACE FUNCTION get_invite_link_info(invite_token TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  group_name TEXT,
  inviter_name TEXT,
  expires_at TIMESTAMPTZ,
  is_expired BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    TRUE,
    g.name,
    u.display_name,
    gil.expires_at,
    gil.expires_at < now()
  FROM group_invite_links gil
  JOIN groups g ON g.id = gil.group_id
  JOIN users u ON u.id = gil.created_by_user_id
  WHERE gil.token = invite_token
  UNION ALL
  SELECT FALSE, NULL, NULL, NULL, NULL
  WHERE NOT EXISTS (
    SELECT 1 FROM group_invite_links WHERE token = invite_token
  );
$$;
