-- Improve spouse linking to work for all generations and support unlinking.

CREATE OR REPLACE FUNCTION public.link_spouses_via_session(
  session_token text,
  person_a uuid,
  person_b uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_a uuid;
  old_b uuid;
BEGIN
  IF NOT public.is_valid_family_session(session_token) THEN
    RAISE EXCEPTION 'invalid_session';
  END IF;

  IF person_a = person_b THEN
    RAISE EXCEPTION 'cannot_link_to_self';
  END IF;

  SELECT spouse_id INTO old_a FROM people WHERE id = person_a;
  SELECT spouse_id INTO old_b FROM people WHERE id = person_b;

  -- Clear existing pairings (both directions)
  IF old_a IS NOT NULL THEN
    UPDATE people SET spouse_id = NULL WHERE id = old_a;
  END IF;
  IF old_b IS NOT NULL THEN
    UPDATE people SET spouse_id = NULL WHERE id = old_b;
  END IF;
  UPDATE people SET spouse_id = NULL WHERE id IN (person_a, person_b);

  -- Link new pair
  UPDATE people SET spouse_id = person_b WHERE id = person_a;
  UPDATE people SET spouse_id = person_a WHERE id = person_b;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlink_spouses_via_session(
  session_token text,
  person_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  spouse uuid;
BEGIN
  IF NOT public.is_valid_family_session(session_token) THEN
    RAISE EXCEPTION 'invalid_session';
  END IF;

  SELECT spouse_id INTO spouse FROM people WHERE id = person_id;
  UPDATE people SET spouse_id = NULL WHERE id = person_id;
  IF spouse IS NOT NULL THEN
    UPDATE people SET spouse_id = NULL WHERE id = spouse;
  END IF;
END;
$$;

