ALTER TABLE people ADD COLUMN IF NOT EXISTS death_date_gregorian date;
ALTER TABLE people ADD COLUMN IF NOT EXISTS death_date_hebrew text;

CREATE OR REPLACE FUNCTION public.update_death_dates_via_admin_session(
  admin_session_token text,
  p_person_id uuid,
  p_death_date_gregorian date DEFAULT NULL,
  p_death_date_hebrew text DEFAULT NULL
)
RETURNS people
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result people;
BEGIN
  IF NOT public.is_valid_admin_session(admin_session_token) THEN
    RAISE EXCEPTION 'admin_required';
  END IF;

  UPDATE people
  SET
    death_date_gregorian = p_death_date_gregorian,
    death_date_hebrew = p_death_date_hebrew
  WHERE id = p_person_id
  RETURNING * INTO result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'person_not_found';
  END IF;

  RETURN result;
END;
$function$;
