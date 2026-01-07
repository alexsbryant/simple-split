-- SECURITY DEFINER function to create notifications
-- Bypasses RLS to allow server actions to create notifications

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_actor_user_id UUID,
  p_type TEXT,
  p_group_id UUID DEFAULT NULL,
  p_expense_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Skip if actor == recipient (no self-notifications)
  IF p_user_id = p_actor_user_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (user_id, actor_user_id, type, group_id, expense_id, metadata)
  VALUES (p_user_id, p_actor_user_id, p_type, p_group_id, p_expense_id, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;
