-- Helper function to check if a user email exists
-- Uses SECURITY DEFINER to bypass RLS (needed because inviter can't see non-group-members)

CREATE OR REPLACE FUNCTION check_user_email_exists(check_email TEXT)
RETURNS TABLE (user_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE LOWER(email) = LOWER(check_email) LIMIT 1;
$$;
