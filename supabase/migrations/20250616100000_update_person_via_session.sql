ALTER TABLE people ADD COLUMN IF NOT EXISTS maiden_name text;

CREATE OR REPLACE FUNCTION public.update_person_via_session(
  session_token text,
  p_person_id uuid,
  p_full_name text,
  p_nickname text DEFAULT NULL,
  p_birth_date_gregorian date DEFAULT NULL,
  p_birth_date_hebrew text DEFAULT NULL,
  p_residence text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_maiden_name text DEFAULT NULL,
  p_family_position text DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_parent_id uuid DEFAULT NULL
)
 RETURNS people
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result people;
BEGIN
  IF NOT public.is_valid_data_session(session_token) THEN
    RAISE EXCEPTION 'invalid_session';
  END IF;

  UPDATE people
  SET
    full_name = p_full_name,
    nickname = p_nickname,
    birth_date_gregorian = p_birth_date_gregorian,
    birth_date_hebrew = p_birth_date_hebrew,
    residence = p_residence,
    phone = p_phone,
    email = p_email,
    maiden_name = p_maiden_name,
    family_position = p_family_position,
    gender = p_gender,
    parent_id = p_parent_id
  WHERE id = p_person_id
  RETURNING * INTO result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'person_not_found';
  END IF;

  RETURN result;
END;
$function$;
