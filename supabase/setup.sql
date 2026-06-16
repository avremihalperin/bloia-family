-- הרץ קובץ זה ב-Supabase → SQL Editor → New query → Run
-- פרויקט: mokedadiad@gmail.com's Project

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- App settings
CREATE TABLE IF NOT EXISTS app_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  family_password_hash text,
  tree_name text DEFAULT 'עץ המשפחה',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Branches
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  root_person_id uuid,
  label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- People
CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  nickname text,
  birth_date_gregorian date,
  birth_date_hebrew text,
  photo_url text,
  residence text,
  phone text,
  email text,
  maiden_name text,
  generation smallint,
  family_position text,
  gender text CHECK (gender IS NULL OR gender IN ('male', 'female')),
  parent_id uuid REFERENCES people(id) ON DELETE SET NULL,
  spouse_id uuid REFERENCES people(id) ON DELETE SET NULL,
  branch_id uuid,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_placeholder boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE branches DROP CONSTRAINT IF EXISTS branches_root_person_id_fkey;
ALTER TABLE branches
  ADD CONSTRAINT branches_root_person_id_fkey
  FOREIGN KEY (root_person_id) REFERENCES people(id) ON DELETE CASCADE;

ALTER TABLE people DROP CONSTRAINT IF EXISTS people_branch_id_fkey;
ALTER TABLE people
  ADD CONSTRAINT people_branch_id_fkey
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id uuid REFERENCES people(id) ON DELETE SET NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Invitations
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  target_person_id uuid REFERENCES people(id) ON DELETE SET NULL,
  parent_person_id uuid REFERENCES people(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Family sessions
CREATE TABLE IF NOT EXISTS family_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_people_parent_id ON people(parent_id);
CREATE INDEX IF NOT EXISTS idx_people_branch_id ON people(branch_id);
CREATE INDEX IF NOT EXISTS idx_people_generation ON people(generation);
CREATE INDEX IF NOT EXISTS idx_people_claimed_by ON people(claimed_by);
CREATE INDEX IF NOT EXISTS idx_people_phone ON people(phone);
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_family_sessions_token ON family_sessions(token);

-- Updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_people_updated_at ON people;
CREATE TRIGGER trg_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON app_settings;
CREATE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Generation / branch triggers
CREATE OR REPLACE FUNCTION compute_person_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  parent_rec people%ROWTYPE;
BEGIN
  IF NEW.parent_id IS NULL THEN
    IF NEW.generation IS NULL THEN
      NEW.generation := 1;
    END IF;
  ELSE
    SELECT * INTO parent_rec FROM people WHERE id = NEW.parent_id;
    IF FOUND THEN
      NEW.generation := COALESCE(parent_rec.generation, 1) + 1;
      IF parent_rec.branch_id IS NOT NULL AND NEW.generation > 2 THEN
        NEW.branch_id := parent_rec.branch_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_people_hierarchy ON people;
CREATE TRIGGER trg_people_hierarchy
  BEFORE INSERT OR UPDATE OF parent_id ON people
  FOR EACH ROW EXECUTE FUNCTION compute_person_hierarchy();

CREATE OR REPLACE FUNCTION create_branch_for_gen2()
RETURNS TRIGGER AS $$
DECLARE
  new_branch_id uuid;
BEGIN
  IF NEW.generation = 2 AND NEW.branch_id IS NULL THEN
    INSERT INTO branches (root_person_id, label)
    VALUES (NEW.id, 'משפחת ' || NEW.full_name)
    RETURNING id INTO new_branch_id;
    UPDATE people SET branch_id = new_branch_id WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_people_branch_gen2 ON people;
CREATE TRIGGER trg_people_branch_gen2
  AFTER INSERT ON people
  FOR EACH ROW EXECUTE FUNCTION create_branch_for_gen2();

-- RLS helpers
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.my_person_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT person_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.can_edit_person(target_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin()
    OR EXISTS (SELECT 1 FROM people WHERE id = target_id AND claimed_by = auth.uid())
    OR EXISTS (SELECT 1 FROM people WHERE id = target_id AND parent_id = public.my_person_id())
    OR EXISTS (SELECT 1 FROM people WHERE id = target_id AND created_by = auth.uid());
$$;

-- Family session RPCs
CREATE OR REPLACE FUNCTION public.check_family_password(input_password text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE stored_hash text;
BEGIN
  SELECT family_password_hash INTO stored_hash FROM app_settings WHERE id = 1;
  IF stored_hash IS NULL THEN RETURN false; END IF;
  RETURN stored_hash = extensions.crypt(input_password, stored_hash);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_family_session(input_password text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE session_token text;
BEGIN
  IF NOT public.check_family_password(input_password) THEN
    RAISE EXCEPTION 'invalid_password';
  END IF;
  session_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO family_sessions (token, expires_at) VALUES (session_token, now() + interval '7 days');
  RETURN session_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_family_session(session_token text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM family_sessions WHERE token = session_token AND expires_at > now());
$$;

CREATE OR REPLACE FUNCTION public.setup_family_password(new_password text, new_tree_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM app_settings WHERE id = 1 AND family_password_hash IS NOT NULL) THEN
    RAISE EXCEPTION 'already_setup';
  END IF;
  UPDATE app_settings SET family_password_hash = extensions.crypt(new_password, extensions.gen_salt('bf'::text)), tree_name = COALESCE(new_tree_name, 'עץ המשפחה') WHERE id = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_people_filtered(
  session_token text, branch_filter uuid DEFAULT NULL, generation_filter smallint DEFAULT NULL,
  search_query text DEFAULT NULL, residence_filter text DEFAULT NULL
) RETURNS SETOF people LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_family_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  RETURN QUERY SELECT p.* FROM people p
  WHERE (branch_filter IS NULL OR p.branch_id = branch_filter)
    AND (generation_filter IS NULL OR p.generation = generation_filter)
    AND (residence_filter IS NULL OR p.residence ILIKE '%' || residence_filter || '%')
    AND (search_query IS NULL OR p.full_name ILIKE '%' || search_query || '%' OR p.nickname ILIKE '%' || search_query || '%' OR p.phone ILIKE '%' || search_query || '%' OR p.email ILIKE '%' || search_query || '%')
  ORDER BY p.generation, p.full_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_branches_filtered(session_token text)
RETURNS SETOF branches LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_family_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  RETURN QUERY SELECT b.* FROM branches b ORDER BY b.label;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_person_by_id(session_token text, person_id uuid)
RETURNS people LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result people;
BEGIN
  IF NOT public.is_valid_family_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  SELECT * INTO result FROM people WHERE id = person_id;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_app_settings_public(session_token text)
RETURNS TABLE(tree_name text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_family_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  RETURN QUERY SELECT a.tree_name FROM app_settings a WHERE a.id = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_person_via_session(
  session_token text, p_full_name text, p_nickname text DEFAULT NULL,
  p_birth_date_gregorian date DEFAULT NULL, p_birth_date_hebrew text DEFAULT NULL,
  p_residence text DEFAULT NULL, p_phone text DEFAULT NULL, p_email text DEFAULT NULL, p_maiden_name text DEFAULT NULL, p_family_position text DEFAULT NULL,
  p_gender text DEFAULT NULL, p_parent_id uuid DEFAULT NULL, p_generation smallint DEFAULT NULL
) RETURNS people LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result people;
BEGIN
  IF NOT public.is_valid_family_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  INSERT INTO people (full_name, nickname, birth_date_gregorian, birth_date_hebrew, residence, phone, email, maiden_name, family_position, gender, parent_id, generation)
  VALUES (p_full_name, p_nickname, p_birth_date_gregorian, p_birth_date_hebrew, p_residence, p_phone, p_email, p_maiden_name, p_family_position, p_gender, p_parent_id, p_generation)
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_invitation_via_session(session_token text, p_parent_person_id uuid)
RETURNS invitations LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result invitations;
BEGIN
  IF NOT public.is_valid_family_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  INSERT INTO invitations (parent_person_id) VALUES (p_parent_person_id) RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token text)
RETURNS invitations LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM invitations WHERE token = p_token;
$$;

CREATE OR REPLACE FUNCTION public.get_parents_for_invitation(p_token text)
RETURNS SETOF people LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE inv invitations;
BEGIN
  SELECT * INTO inv FROM invitations WHERE token = p_token;
  IF NOT FOUND OR inv.used_at IS NOT NULL OR inv.expires_at < now() THEN RETURN; END IF;
  RETURN QUERY SELECT p.* FROM people p WHERE p.generation >= 2 ORDER BY p.generation, p.full_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_person_via_invitation(
  p_token text, p_user_id uuid, p_full_name text, p_nickname text DEFAULT NULL,
  p_birth_date_gregorian date DEFAULT NULL, p_birth_date_hebrew text DEFAULT NULL,
  p_residence text DEFAULT NULL, p_phone text DEFAULT NULL, p_email text DEFAULT NULL, p_maiden_name text DEFAULT NULL, p_family_position text DEFAULT NULL,
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
) RETURNS people LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result people;
BEGIN
  IF NOT public.is_valid_data_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  UPDATE people SET
    full_name = p_full_name, nickname = p_nickname,
    birth_date_gregorian = p_birth_date_gregorian, birth_date_hebrew = p_birth_date_hebrew,
    residence = p_residence, phone = p_phone, email = p_email, maiden_name = p_maiden_name,
    family_position = p_family_position, gender = p_gender, parent_id = p_parent_id
  WHERE id = p_person_id RETURNING * INTO result;
  IF NOT FOUND THEN RAISE EXCEPTION 'person_not_found'; END IF;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.link_spouses_via_session(session_token text, person_a uuid, person_b uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_family_session(session_token) THEN RAISE EXCEPTION 'invalid_session'; END IF;
  UPDATE people SET spouse_id = person_b WHERE id = person_a;
  UPDATE people SET spouse_id = person_a WHERE id = person_b;
END;
$$;

-- Grants
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_settings_admin ON app_settings;
CREATE POLICY app_settings_admin ON app_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS branches_select ON branches;
CREATE POLICY branches_select ON branches FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS branches_admin ON branches;
CREATE POLICY branches_admin ON branches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS people_select ON people;
CREATE POLICY people_select ON people FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS people_admin ON people;
CREATE POLICY people_admin ON people FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS people_insert ON people;
CREATE POLICY people_insert ON people FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR parent_id = public.my_person_id() OR created_by = auth.uid());
DROP POLICY IF EXISTS people_update ON people;
CREATE POLICY people_update ON people FOR UPDATE TO authenticated USING (public.can_edit_person(id)) WITH CHECK (public.can_edit_person(id));
DROP POLICY IF EXISTS people_delete ON people;
CREATE POLICY people_delete ON people FOR DELETE TO authenticated USING (public.is_admin() OR created_by = auth.uid());

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS profiles_insert ON profiles;
CREATE POLICY profiles_insert ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS invitations_select ON invitations;
CREATE POLICY invitations_select ON invitations FOR SELECT TO authenticated USING (public.is_admin() OR created_by = auth.uid());
DROP POLICY IF EXISTS invitations_admin ON invitations;
CREATE POLICY invitations_admin ON invitations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS invitations_insert ON invitations;
CREATE POLICY invitations_insert ON invitations FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR created_by = auth.uid());

-- Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 524288, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS avatars_select ON storage.objects;
CREATE POLICY avatars_select ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS avatars_insert ON storage.objects;
CREATE POLICY avatars_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
DROP POLICY IF EXISTS avatars_update ON storage.objects;
CREATE POLICY avatars_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
DROP POLICY IF EXISTS avatars_delete ON storage.objects;
CREATE POLICY avatars_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

-- Auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, is_admin) VALUES (NEW.id, false) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
