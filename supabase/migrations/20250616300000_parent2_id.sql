ALTER TABLE people ADD COLUMN IF NOT EXISTS parent2_id uuid REFERENCES people(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_people_parent2_id ON people(parent2_id);

-- שיוך רטרואקטיבי: הורה שני = בן/בת הזוג של ההורה הראשי
UPDATE people child
SET parent2_id = parent.spouse_id
FROM people parent
WHERE child.parent_id = parent.id
  AND parent.spouse_id IS NOT NULL
  AND child.parent2_id IS NULL
  AND child.parent_id <> parent.spouse_id;

CREATE OR REPLACE FUNCTION public.insert_person_via_session(
  session_token text, p_full_name text, p_nickname text DEFAULT NULL,
  p_birth_date_gregorian date DEFAULT NULL, p_birth_date_hebrew text DEFAULT NULL,
  p_residence text DEFAULT NULL, p_phone text DEFAULT NULL, p_email text DEFAULT NULL,
  p_maiden_name text DEFAULT NULL, p_family_position text DEFAULT NULL,
  p_gender text DEFAULT NULL, p_parent_id uuid DEFAULT NULL, p_parent2_id uuid DEFAULT NULL,
  p_generation smallint DEFAULT NULL,
  p_marital_status text DEFAULT NULL, p_honorific text DEFAULT NULL,
  p_is_soldier boolean DEFAULT false, p_spouse_name text DEFAULT NULL
) RETURNS people LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result people;
BEGIN
  IF NOT public.is_valid_data_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  INSERT INTO people (
    full_name, nickname, birth_date_gregorian, birth_date_hebrew, residence, phone, email,
    maiden_name, family_position, gender, parent_id, parent2_id, generation,
    marital_status, honorific, is_soldier, spouse_name
  )
  VALUES (
    p_full_name, p_nickname, p_birth_date_gregorian, p_birth_date_hebrew, p_residence, p_phone, p_email,
    p_maiden_name, p_family_position, p_gender, p_parent_id, p_parent2_id, p_generation,
    p_marital_status, p_honorific, COALESCE(p_is_soldier, false), p_spouse_name
  )
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_person_via_invitation(
  p_token text, p_user_id uuid, p_full_name text, p_nickname text DEFAULT NULL,
  p_birth_date_gregorian date DEFAULT NULL, p_birth_date_hebrew text DEFAULT NULL,
  p_residence text DEFAULT NULL, p_phone text DEFAULT NULL, p_email text DEFAULT NULL,
  p_maiden_name text DEFAULT NULL, p_family_position text DEFAULT NULL,
  p_gender text DEFAULT NULL, p_parent_id uuid DEFAULT NULL, p_parent2_id uuid DEFAULT NULL,
  p_marital_status text DEFAULT NULL, p_honorific text DEFAULT NULL,
  p_is_soldier boolean DEFAULT false, p_spouse_name text DEFAULT NULL
) RETURNS people LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv invitations; result people; parent_id uuid;
BEGIN
  SELECT * INTO inv FROM invitations WHERE token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'invitation_not_found'; END IF;
  IF inv.used_at IS NOT NULL THEN RAISE EXCEPTION 'invitation_used'; END IF;
  IF inv.expires_at < now() THEN RAISE EXCEPTION 'invitation_expired'; END IF;
  parent_id := COALESCE(p_parent_id, inv.parent_person_id);
  IF parent_id IS NULL THEN RAISE EXCEPTION 'parent_required'; END IF;
  INSERT INTO people (
    full_name, nickname, birth_date_gregorian, birth_date_hebrew, residence, phone, email,
    maiden_name, family_position, gender, parent_id, parent2_id, created_by, claimed_by,
    marital_status, honorific, is_soldier, spouse_name
  )
  VALUES (
    p_full_name, p_nickname, p_birth_date_gregorian, p_birth_date_hebrew, p_residence, p_phone, p_email,
    p_maiden_name, p_family_position, p_gender, parent_id, p_parent2_id, p_user_id, p_user_id,
    p_marital_status, p_honorific, COALESCE(p_is_soldier, false), p_spouse_name
  )
  RETURNING * INTO result;
  INSERT INTO profiles (id, person_id) VALUES (p_user_id, result.id) ON CONFLICT (id) DO UPDATE SET person_id = result.id;
  UPDATE invitations SET used_at = now(), target_person_id = result.id WHERE id = inv.id;
  RETURN result;
END;
$$;

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
  p_parent_id uuid DEFAULT NULL,
  p_parent2_id uuid DEFAULT NULL,
  p_marital_status text DEFAULT NULL,
  p_honorific text DEFAULT NULL,
  p_is_soldier boolean DEFAULT false,
  p_spouse_name text DEFAULT NULL
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
    parent_id = p_parent_id,
    parent2_id = p_parent2_id,
    marital_status = p_marital_status,
    honorific = p_honorific,
    is_soldier = COALESCE(p_is_soldier, false),
    spouse_name = p_spouse_name
  WHERE id = p_person_id
  RETURNING * INTO result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'person_not_found';
  END IF;

  RETURN result;
END;
$function$;
