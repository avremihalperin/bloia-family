"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFamilyDbToken, verifyFamilySession } from "@/lib/family-session";
import { getAdminDbToken, verifyAdminSession } from "@/lib/admin-session";
import { gregorianToHebrew } from "@/lib/hebrew-date";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin, getProfile, getPerson } from "@/lib/data";
import { resolveParentPair } from "@/lib/parents";
import type { Person, PersonFormData } from "@/lib/types";

function resolveHebrewDate(gregorian?: string, hebrew?: string) {
  const trimmed = hebrew?.trim();
  return trimmed || gregorianToHebrew(gregorian) || null;
}

function personPayload(data: PersonFormData) {
  return {
    full_name: data.full_name,
    nickname: data.nickname || null,
    birth_date_gregorian: data.birth_date_gregorian || null,
    birth_date_hebrew: resolveHebrewDate(data.birth_date_gregorian, data.birth_date_hebrew),
    residence: data.residence || null,
    phone: data.phone || null,
    email: data.email || null,
    maiden_name: data.maiden_name || null,
    family_position: data.family_position || null,
    gender: data.gender || null,
    parent_id: data.parent_id || null,
    parent2_id: data.parent2_id || null,
    marital_status: data.marital_status || null,
    honorific: data.honorific?.trim() || null,
    is_soldier: data.is_soldier ?? false,
    spouse_name:
      data.marital_status === "married" ? data.spouse_name?.trim() || null : null,
  };
}

async function withResolvedParents(data: PersonFormData) {
  const base = personPayload(data);
  if (!base.parent_id) {
    return { ...base, parent2_id: null };
  }

  const parent = await getPerson(base.parent_id);
  if (!parent) return base;

  return {
    ...base,
    ...resolveParentPair(base.parent_id, new Map([[parent.id, parent]])),
  };
}

function personToFormData(person: Person): PersonFormData {
  return {
    full_name: person.full_name,
    nickname: person.nickname ?? undefined,
    birth_date_gregorian: person.birth_date_gregorian ?? undefined,
    birth_date_hebrew: person.birth_date_hebrew ?? undefined,
    residence: person.residence ?? undefined,
    phone: person.phone ?? undefined,
    email: person.email ?? undefined,
    maiden_name: person.maiden_name ?? undefined,
    family_position: person.family_position ?? undefined,
    gender: person.gender,
    marital_status: person.marital_status ?? undefined,
    honorific: person.honorific ?? undefined,
    is_soldier: person.is_soldier,
    spouse_name: person.spouse_name ?? undefined,
    parent_id: person.parent_id ?? undefined,
  };
}

async function getSessionToken() {
  const familyToken = await getFamilyDbToken();
  if (familyToken && (await verifyFamilySession())) return familyToken;

  const adminToken = await getAdminDbToken();
  if (adminToken && (await verifyAdminSession())) return adminToken;

  return null;
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

    const payload = await withResolvedParents(data);
    const { data: person, error } = await supabase
      .from("people")
      .insert({
        ...payload,
        generation: data.generation || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/");
    revalidatePath("/tree");
    return person;
  }

  if (token) {
    const payload = await withResolvedParents(data);
    const { data: person, error } = await supabase.rpc("insert_person_via_session", {
      session_token: token,
      p_full_name: payload.full_name,
      p_nickname: payload.nickname,
      p_birth_date_gregorian: payload.birth_date_gregorian,
      p_birth_date_hebrew: payload.birth_date_hebrew,
      p_residence: payload.residence,
      p_phone: payload.phone,
      p_email: payload.email,
      p_maiden_name: payload.maiden_name,
      p_family_position: payload.family_position,
      p_gender: payload.gender,
      p_parent_id: payload.parent_id,
      p_parent2_id: payload.parent2_id,
      p_generation: data.generation || null,
      p_marital_status: payload.marital_status,
      p_honorific: payload.honorific,
      p_is_soldier: payload.is_soldier,
      p_spouse_name: payload.spouse_name,
    });

    if (error) throw error;
    revalidatePath("/");
    return person;
  }

  if (hasAdminClient()) {
    const admin = createAdminClient();
    const payload = await withResolvedParents(data);
    const { data: person, error } = await admin
      .from("people")
      .insert({
        ...payload,
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
  const token = await getSessionToken();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const payload = await withResolvedParents(data);

  if (token) {
    const { data: person, error } = await supabase.rpc("update_person_via_session", {
      session_token: token,
      p_person_id: id,
      p_full_name: payload.full_name,
      p_nickname: payload.nickname,
      p_birth_date_gregorian: payload.birth_date_gregorian,
      p_birth_date_hebrew: payload.birth_date_hebrew,
      p_residence: payload.residence,
      p_phone: payload.phone,
      p_email: payload.email,
      p_maiden_name: payload.maiden_name,
      p_family_position: payload.family_position,
      p_gender: payload.gender,
      p_parent_id: payload.parent_id,
      p_parent2_id: payload.parent2_id,
      p_marital_status: payload.marital_status,
      p_honorific: payload.honorific,
      p_is_soldier: payload.is_soldier,
      p_spouse_name: payload.spouse_name,
    });

    if (error) throw error;
    revalidatePath("/");
    revalidatePath(`/person/${id}`);
    revalidatePath(`/person/${id}/edit`);
    return person;
  }

  if (!user) {
    throw new Error("נדרשת התחברות לעריכה");
  }

  const { data: person, error } = await supabase
    .from("people")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/tree");
  revalidatePath(`/person/${id}`);
  revalidatePath(`/person/${id}/edit`);
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
  data: PersonFormData,
  photoFile?: File | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("נדרשת התחברות");

  const payload = await withResolvedParents(data);

  const { data: person, error } = await supabase.rpc("register_person_via_invitation", {
    p_token: inviteToken,
    p_user_id: user.id,
    p_full_name: payload.full_name,
    p_nickname: payload.nickname,
    p_birth_date_gregorian: payload.birth_date_gregorian,
    p_birth_date_hebrew: payload.birth_date_hebrew,
    p_residence: payload.residence,
    p_phone: payload.phone,
    p_email: payload.email,
    p_maiden_name: payload.maiden_name,
    p_family_position: payload.family_position,
    p_gender: payload.gender,
    p_parent_id: payload.parent_id,
    p_parent2_id: payload.parent2_id,
    p_marital_status: payload.marital_status,
    p_honorific: payload.honorific,
    p_is_soldier: payload.is_soldier,
    p_spouse_name: payload.spouse_name,
  });

  if (error) throw error;
  if (photoFile) await uploadPhotoForNewPerson(person.id, photoFile);
  revalidatePath("/");
  return person;
}

async function getSessionTokenForUpload() {
  const adminToken = await getAdminDbToken();
  if (adminToken && (await verifyAdminSession())) return adminToken;
  const familyToken = await getFamilyDbToken();
  if (familyToken && (await verifyFamilySession())) return familyToken;
  return null;
}

async function uploadImageToStorage(bucket: string, path: string, file: File) {
  const sessionToken = await getSessionTokenForUpload();
  const supabase = await createClient();
  const client =
    sessionToken && hasAdminClient() ? createAdminClient() : supabase;

  const { error } = await client.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;

  const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

export async function uploadPersonPhoto(personId: string, formData: FormData) {
  const file = formData.get("photo") as File;
  if (!file) throw new Error("לא נבחר קובץ");

  const sessionToken = await getSessionTokenForUpload();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let allowed = Boolean(sessionToken);

  if (!allowed && user) {
    const profile = await getProfile();
    allowed =
      profile?.person_id === personId ||
      profile?.is_admin ||
      false;
  }

  if (!allowed) throw new Error("אין הרשאה להעלאת תמונה");

  const ext = file.name.split(".").pop() || "jpg";
  const publicUrl = await uploadImageToStorage(
    "family-photos",
    `people/${personId}/${Date.now()}.${ext}`,
    file
  );

  if (sessionToken) {
    const { error } = await supabase.rpc("update_person_photo_via_session", {
      session_token: sessionToken,
      p_person_id: personId,
      p_photo_url: publicUrl,
    });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("people")
      .update({ photo_url: publicUrl })
      .eq("id", personId);
    if (error) throw error;
  }

  revalidatePath(`/person/${personId}`);
  revalidatePath("/");
  return publicUrl;
}

export async function uploadBranchPhoto(branchId: string, formData: FormData) {
  const file = formData.get("photo") as File;
  if (!file) throw new Error("לא נבחר קובץ");

  const sessionToken = await getSessionTokenForUpload();
  if (!sessionToken) throw new Error("נדרשת הרשאת מנהל");

  const ext = file.name.split(".").pop() || "jpg";
  const publicUrl = await uploadImageToStorage(
    "family-photos",
    `branches/${branchId}/${Date.now()}.${ext}`,
    file
  );

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_branch_photo_via_session", {
    session_token: sessionToken,
    p_branch_id: branchId,
    p_photo_url: publicUrl,
  });
  if (error) throw error;

  revalidatePath("/admin/seed");
  revalidatePath("/");
  return publicUrl;
}

export async function updateBranchLabel(branchId: string, label: string) {
  const trimmed = label.trim();
  if (!trimmed) throw new Error("נא להזין שם ענף");

  const token = await getSessionToken();
  if (!token) throw new Error("נדרשת הרשאה");

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_branch_label_via_session", {
    session_token: token,
    p_branch_id: branchId,
    p_label: trimmed,
  });

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/table");
  revalidatePath("/admin/seed");
}

export async function uploadPhotoForNewPerson(personId: string, file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  return uploadPersonPhoto(personId, formData);
}

export async function uploadPhoto(personId: string, formData: FormData) {
  return uploadPersonPhoto(personId, formData);
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
    revalidatePath(`/person/${personId}`);
    revalidatePath(`/person/${spouseId}`);
    return;
  }

  const admin = await isCurrentUserAdmin();
  if (!admin) throw new Error("אין הרשאה");

  const client = hasAdminClient() ? createAdminClient() : supabase;
  const { data: existing, error: existingError } = await client
    .from("people")
    .select("id, spouse_id")
    .in("id", [personId, spouseId]);
  if (existingError) throw existingError;

  const oldSpouses = (existing ?? [])
    .map((p) => p.spouse_id)
    .filter((id): id is string => Boolean(id));

  if (oldSpouses.length > 0) {
    await client.from("people").update({ spouse_id: null }).in("id", oldSpouses);
  }

  await client.from("people").update({ spouse_id: null }).in("id", [personId, spouseId]);
  await client.from("people").update({ spouse_id: spouseId }).eq("id", personId);
  await client.from("people").update({ spouse_id: personId }).eq("id", spouseId);
  revalidatePath("/");
  revalidatePath(`/person/${personId}`);
  revalidatePath(`/person/${spouseId}`);
}

export async function unlinkSpouses(personId: string) {
  const token = await getSessionToken();
  const supabase = await createClient();

  if (token) {
    const { error } = await supabase.rpc("unlink_spouses_via_session", {
      session_token: token,
      person_id: personId,
    });
    if (error) throw error;
    revalidatePath("/");
    revalidatePath(`/person/${personId}`);
    return;
  }

  const admin = await isCurrentUserAdmin();
  if (!admin) throw new Error("אין הרשאה");

  const client = hasAdminClient() ? createAdminClient() : supabase;
  const { data: current, error } = await client
    .from("people")
    .select("spouse_id")
    .eq("id", personId)
    .single();
  if (error) throw error;

  await client.from("people").update({ spouse_id: null }).eq("id", personId);
  if (current?.spouse_id) {
    await client.from("people").update({ spouse_id: null }).eq("id", current.spouse_id);
    revalidatePath(`/person/${current.spouse_id}`);
  }

  revalidatePath("/");
  revalidatePath(`/person/${personId}`);
}

export async function createGen1Person(data: PersonFormData, photoFile?: File | null) {
  const person = await createPerson({ ...data, generation: 1 });
  if (photoFile) await uploadPhotoForNewPerson(person.id, photoFile);
  return person;
}

export async function createGen2Person(data: PersonFormData, photoFile?: File | null) {
  const person = await createPerson({ ...data, generation: 2 });
  if (photoFile) await uploadPhotoForNewPerson(person.id, photoFile);
  return person;
}

export async function updatePersonAction(id: string, data: PersonFormData) {
  await updatePerson(id, data);
}

export async function addChildAction(
  parentId: string,
  data: PersonFormData,
  photoFile?: File | null
) {
  const child = await createPerson({ ...data, parent_id: parentId });
  if (photoFile) await uploadPhotoForNewPerson(child.id, photoFile);
  revalidatePath("/tree");
  redirect(`/person/${child.id}`);
}

export async function addSiblingAction(
  personId: string,
  data: PersonFormData,
  photoFile?: File | null
) {
  const person = await getPerson(personId);
  if (!person) throw new Error("לא נמצא");
  if (!person.parent_id) {
    throw new Error("אין הורה משותף — קשר קודם להורה או הוסף ילד דרך ההורה");
  }
  await addChildAction(person.parent_id, data, photoFile);
}

export async function setParentAction(personId: string, parentId: string) {
  const person = await getPerson(personId);
  if (!person) throw new Error("לא נמצא");
  if (personId === parentId) throw new Error("לא ניתן לבחור את עצמו כהורה");

  await updatePerson(personId, {
    ...personToFormData(person),
    parent_id: parentId,
  });
  revalidatePath("/tree");
  redirect(`/person/${personId}`);
}

export async function linkParentAction(personId: string, parentId: string) {
  const person = await getPerson(personId);
  if (!person) throw new Error("לא נמצא");
  if (personId === parentId) throw new Error("לא ניתן לבחור את עצמו כהורה");

  await updatePerson(personId, {
    ...personToFormData(person),
    parent_id: parentId,
  });
  revalidatePath("/tree");
  revalidatePath(`/person/${personId}`);
  revalidatePath(`/person/${personId}/edit`);
}

export async function clearParentAction(personId: string) {
  const person = await getPerson(personId);
  if (!person) throw new Error("לא נמצא");

  await updatePerson(personId, {
    ...personToFormData(person),
    parent_id: undefined,
  });
  revalidatePath("/tree");
  revalidatePath(`/person/${personId}`);
  revalidatePath(`/person/${personId}/edit`);
}

export async function resetFamilyPasswordViaAdmin(
  newPassword: string,
  newTreeName?: string
) {
  const adminToken = await getAdminDbToken();
  if (!adminToken || !(await verifyAdminSession())) {
    throw new Error("נדרשת הרשאת מנהל");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_family_password_via_admin", {
    admin_session_token: adminToken,
    new_password: newPassword,
    new_tree_name: newTreeName || null,
  });

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/seed");
}
