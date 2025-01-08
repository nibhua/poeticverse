CREATE OR REPLACE FUNCTION public.delete_auth_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get the ID of the authenticated user
  _user_id := auth.uid();
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_auth_user() TO authenticated;