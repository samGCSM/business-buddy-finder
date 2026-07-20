
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN (
    SELECT id FROM users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    LIMIT 1
  );
END;
$function$;

ALTER VIEW public.user_stats SET (security_invoker = true);
