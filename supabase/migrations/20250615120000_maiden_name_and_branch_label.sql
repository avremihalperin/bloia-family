ALTER TABLE people ADD COLUMN IF NOT EXISTS maiden_name text;

CREATE OR REPLACE FUNCTION public.update_branch_label_via_session(
  session_token text,
  p_branch_id uuid,
  p_label text
)
 RETURNS branches
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result branches;
BEGIN
  IF NOT public.is_valid_data_session(session_token) THEN
    RAISE EXCEPTION 'invalid_session';
  END IF;

  IF p_label IS NULL OR btrim(p_label) = '' THEN
    RAISE EXCEPTION 'label_required';
  END IF;

  UPDATE branches
  SET label = btrim(p_label)
  WHERE id = p_branch_id
  RETURNING * INTO result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'branch_not_found';
  END IF;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_person_via_session(
  session_token text, p_full_name text, p_nickname text DEFAULT NULL,
  p_birth_date_gregorian date DEFAULT NULL, p_birth_date_hebrew text DEFAULT NULL,
  p_residence text DEFAULT NULL, p_phone text DEFAULT NULL, p_email text DEFAULT NULL,
  p_maiden_name text DEFAULT NULL, p_family_position text DEFAULT NULL,
  p_gender text DEFAULT NULL, p_parent_id uuid DEFAULT NULL, p_generation smallint DEFAULT NULL
) RETURNS people LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result people;
BEGIN
  IF NOT public.is_valid_data_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  INSERT INTO people (full_name, nickname, birth_date_gregorian, birth_date_hebrew, residence, phone, email, maiden_name, family_position, gender, parent_id, generation)
  VALUES (p_full_name, p_nickname, p_birth_date_gregorian, p_birth_date_hebrew, p_residence, p_phone, p_email, p_maiden_name, p_family_position, p_gender, p_parent_id, p_generation)
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_person_via_invitation(
  p_token text, p_user_id uuid, p_full_name text, p_nickname text DEFAULT NULL,
  p_birth_date_gregorian date DEFAULT NULL, p_birth_date_hebrew text DEFAULT NULL,
  p_residence text DEFAULT NULL, p_phone text DEFAULT NULL, p_email text DEFAULT NULL,
  p_maiden_name text DEFAULT NULL, p_family_position text DEFAULT NULL,
  p_gender text DEFAULT NULL, p_parent_id uuid DEFAULT NULL
) RETURNS people LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv invitations; result people; parent_id uuid;
BEGIN
  SELECT * INTO inv FROM invitations WHERE token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'invitation_not_found'; END IF;
  IF inv.used_at IS NOT NULL THEN RAISE EXCEPTION 'invitation_used'; END IF;
  IF inv.expires_at < now() THEN RAISE EXCEPTION 'invitation_expired'; END IF;
  parent_id := COALESCE(p_parent_id, inv.parent_person_id);
  IF parent_id IS NULL THEN RAISE EXCEPTION 'parent_required'; END IF;
  INSERT INTO people (full_name, nickname, birth_date_gregorian, birth_date_hebrew, residence, phone, email, maiden_name, family_position, gender, parent_id, created_by, claimed_by)
  VALUES (p_full_name, p_nickname, p_birth_date_gregorian, p_birth_date_hebrew, p_residence, p_phone, p_email, p_maiden_name, p_family_position, p_gender, parent_id, p_user_id, p_user_id)
  RETURNING * INTO result;
  INSERT INTO profiles (id, person_id) VALUES (p_user_id, result.id) ON CONFLICT (id) DO UPDATE SET person_id = result.id;
  UPDATE invitations SET used_at = now(), target_person_id = result.id WHERE id = inv.id;
  RETURN result;
END;
$$;
