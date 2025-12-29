-- Function to get user's groups sorted by recent activity
-- Uses SECURITY INVOKER to respect existing RLS policies

CREATE OR REPLACE FUNCTION get_user_groups_with_activity()
RETURNS TABLE (
  id UUID,
  name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  member_count BIGINT,
  creator_display_name TEXT,
  creator_email TEXT,
  last_activity TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    g.id,
    g.name,
    g.created_by,
    g.created_at,
    (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count,
    u.display_name as creator_display_name,
    u.email as creator_email,
    COALESCE(
      (SELECT MAX(GREATEST(e.created_at, COALESCE(e.updated_at, e.created_at)))
       FROM expenses e
       WHERE e.group_id = g.id),
      g.created_at
    ) as last_activity
  FROM groups g
  JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = auth.uid()
  LEFT JOIN users u ON u.id = g.created_by
  ORDER BY last_activity DESC;
$$;
