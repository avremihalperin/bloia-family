import { verifyFamilySession, getFamilyDbToken, requireFamilySession } from "@/lib/family-session";
import { verifyAdminSession, getAdminDbToken } from "@/lib/admin-session";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AppSettings, Branch, Person, Profile } from "@/lib/types";
import { sortPeopleByBirthDate } from "@/lib/sort-people";

async function getSessionToken(): Promise<string | null> {
  const familyToken = await getFamilyDbToken();
  if (familyToken && (await verifyFamilySession())) return familyToken;

  const adminToken = await getAdminDbToken();
  if (adminToken && (await verifyAdminSession())) return adminToken;

  return null;
}

export async function getAppSettings(): Promise<AppSettings | null> {
  const token = await getSessionToken();
  const supabase = await createClient();

  if (token) {
    const { data } = await supabase.rpc("get_app_settings_public", {
      session_token: token,
    });
    if (data?.[0]) {
      return { id: 1, tree_name: data[0].tree_name, family_password_hash: null, created_at: "", updated_at: "" };
    }
  }

  if (hasAdminClient()) {
    const admin = createAdminClient();
    const { data } = await admin.from("app_settings").select("*").eq("id", 1).single();
    return data;
  }

  return null;
}

export async function getPeople(filters?: {
  branchId?: string | null;
  generation?: number | null;
  query?: string | null;
  residence?: string | null;
}): Promise<Person[]> {
  const token = await getSessionToken();
  const supabase = await createClient();

  if (token) {
    const { data, error } = await supabase.rpc("get_people_filtered", {
      session_token: token,
      branch_filter: filters?.branchId || null,
      generation_filter: filters?.generation || null,
      search_query: filters?.query || null,
      residence_filter: filters?.residence || null,
    });
    if (error) throw error;
    return data ?? [];
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    let query = supabase.from("people").select("*").order("generation").order("full_name");
    if (filters?.branchId) query = query.eq("branch_id", filters.branchId);
    if (filters?.generation) query = query.eq("generation", filters.generation);
    if (filters?.residence) query = query.ilike("residence", `%${filters.residence}%`);
    if (filters?.query) {
      query = query.or(
        `full_name.ilike.%${filters.query}%,nickname.ilike.%${filters.query}%,phone.ilike.%${filters.query}%,email.ilike.%${filters.query}%`
      );
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  throw new Error("UNAUTHORIZED");
}

export async function getPerson(id: string): Promise<Person | null> {
  const token = await getSessionToken();
  const supabase = await createClient();

  if (token) {
    const { data, error } = await supabase.rpc("get_person_by_id", {
      session_token: token,
      person_id: id,
    });
    if (error) return null;
    return data;
  }

  const { data, error } = await supabase.from("people").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getBranches(): Promise<Branch[]> {
  const token = await getSessionToken();
  const supabase = await createClient();

  if (token) {
    const { data, error } = await supabase.rpc("get_branches_filtered", {
      session_token: token,
    });
    if (error) throw error;
    return data ?? [];
  }

  const { data, error } = await supabase.from("branches").select("*").order("label");
  if (error) throw error;
  return data ?? [];
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getProfile();
  return profile?.is_admin ?? false;
}

export async function getBranch(id: string): Promise<Branch | null> {
  const branches = await getBranches();
  return branches.find((b) => b.id === id) ?? null;
}

export async function getChildren(parentId: string): Promise<Person[]> {
  const people = await getPeople();
  return sortPeopleByBirthDate(people.filter((p) => p.parent_id === parentId));
}

export async function getPotentialParents(): Promise<Person[]> {
  const people = await getPeople();
  return people.filter((p) => (p.generation ?? 0) >= 2);
}

export async function isPasswordConfigured(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("family_password_is_configured");
  return data === true;
}

export { requireFamilySession };
