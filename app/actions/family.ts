"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFamilyDbToken } from "@/lib/family-session";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin, getProfile } from "@/lib/data";
import type { PersonFormData } from "@/lib/types";

async function getSessionToken() {
  return getFamilyDbToken();
}

export async function createPerson(data: PersonFormData & { generation?: number }) {
  const token = await getSessionToken();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const admin = await isCurrentUserAdmin();
    if (data.generation && data.generation <= 2 && !admin) {
      throw new Error("רק מנהל יכול להוסיף דור 1-2");
    }

    const { data: person, error } = await supabase
      .from("people")
      .insert({
        full_name: data.full_name,
        nickname: data.nickname || null,
        birth_date_gregorian: data.birth_date_gregorian || null,
        birth_date_hebrew: data.birth_date_hebrew || null,
        residence: data.residence || null,
        phone: data.phone || null,
        family_position: data.family_position || null,
        gender: data.gender || null,
        parent_id: data.parent_id || null,
        generation: data.generation || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/");
    return person;
  }

  if (token) {
    const { data: person, error } = await supabase.rpc("insert_person_via_session", {
      session_token: token,
      p_full_name: data.full_name,
      p_nickname: data.nickname || null,
      p_birth_date_gregorian: data.birth_date_gregorian || null,
      p_birth_date_hebrew: data.birth_date_hebrew || null,
      p_residence: data.residence || null,
      p_phone: data.phone || null,
      p_family_position: data.family_position || null,
      p_gender: data.gender || null,
      p_parent_id: data.parent_id || null,
      p_generation: data.generation || null,
    });

    if (error) throw error;
    revalidatePath("/");
    return person;
  }

  if (hasAdminClient()) {
    const admin = createAdminClient();
    const { data: person, error } = await admin
      .from("people")
      .insert({
        full_name: data.full_name,
        nickname: data.nickname || null,
        birth_date_gregorian: data.birth_date_gregorian || null,
        birth_date_hebrew: data.birth_date_hebrew || null,
        residence: data.residence || null,
        phone: data.phone || null,
        family_position: data.family_position || null,
        gender: data.gender || null,
        parent_id: data.parent_id || null,
        generation: data.generation || null,
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/");
    return person;
  }

  throw new Error("נדרשת התחברות");
}

export async function updatePerson(id: string, data: PersonFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("נדרשת התחברות לעריכה. השתמש בקישור ההזמנה האישי.");
  }

  const { data: person, error } = await supabase
    .from("people")
    .update({
      full_name: data.full_name,
      nickname: data.nickname || null,
      birth_date_gregorian: data.birth_date_gregorian || null,
      birth_date_hebrew: data.birth_date_hebrew || null,
      residence: data.residence || null,
      phone: data.phone || null,
      family_position: data.family_position || null,
      gender: data.gender || null,
      parent_id: data.parent_id || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/");
  return person;
}

export async function createInvitation(parentPersonId: string) {
  const token = await getSessionToken();
  const supabase = await createClient();

  if (token) {
    const { data, error } = await supabase.rpc("create_invitation_via_session", {
      session_token: token,
      p_parent_person_id: parentPersonId,
    });
    if (error) throw error;
    return data;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("נדרשת התחברות");

  const client = hasAdminClient() ? createAdminClient() : supabase;
  const { data, error } = await client
    .from("invitations")
    .insert({ parent_person_id: parentPersonId, created_by: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function registerViaInvitation(
  inviteToken: string,
  data: PersonFormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("נדרשת התחברות");

  const { data: person, error } = await supabase.rpc("register_person_via_invitation", {
    p_token: inviteToken,
    p_user_id: user.id,
    p_full_name: data.full_name,
    p_nickname: data.nickname || null,
    p_birth_date_gregorian: data.birth_date_gregorian || null,
    p_birth_date_hebrew: data.birth_date_hebrew || null,
    p_residence: data.residence || null,
    p_phone: data.phone || null,
    p_family_position: data.family_position || null,
    p_gender: data.gender || null,
    p_parent_id: data.parent_id || null,
  });

  if (error) throw error;
  revalidatePath("/");
  return person;
}

export async function uploadPhoto(personId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("נדרשת התחברות");

  const profile = await getProfile();
  const canEdit =
    profile?.person_id === personId || profile?.is_admin;

  if (!canEdit) throw new Error("אין הרשאה");

  const file = formData.get("photo") as File;
  if (!file) throw new Error("לא נבחר קובץ");

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${personId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("people")
    .update({ photo_url: publicUrl })
    .eq("id", personId);

  if (updateError) throw updateError;
  revalidatePath(`/person/${personId}`);
  return publicUrl;
}

export async function linkSpouses(personId: string, spouseId: string) {
  const token = await getSessionToken();
  const supabase = await createClient();

  if (token) {
    const { error } = await supabase.rpc("link_spouses_via_session", {
      session_token: token,
      person_a: personId,
      person_b: spouseId,
    });
    if (error) throw error;
    revalidatePath("/");
    return;
  }

  const admin = await isCurrentUserAdmin();
  if (!admin) throw new Error("אין הרשאה");

  const client = hasAdminClient() ? createAdminClient() : supabase;
  await client.from("people").update({ spouse_id: spouseId }).eq("id", personId);
  await client.from("people").update({ spouse_id: personId }).eq("id", spouseId);
  revalidatePath("/");
}

export async function createGen1Person(data: PersonFormData) {
  return createPerson({ ...data, generation: 1 });
}

export async function createGen2Person(data: PersonFormData) {
  return createPerson({ ...data, generation: 2 });
}

export async function updatePersonAction(id: string, data: PersonFormData) {
  await updatePerson(id, data);
}

export async function addChildAction(parentId: string, data: PersonFormData) {
  const child = await createPerson({ ...data, parent_id: parentId });
  redirect(`/person/${child.id}`);
}
