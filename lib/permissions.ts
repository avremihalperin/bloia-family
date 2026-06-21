import { verifyAdminSession } from "@/lib/admin-session";
import { verifyFamilySession } from "@/lib/family-session";
import { getProfile } from "@/lib/data";
import type { Person } from "@/lib/types";

export async function canEditPerson(person: Person): Promise<boolean> {
  if (await verifyAdminSession()) return true;
  if (await verifyFamilySession()) return true;

  const profile = await getProfile();
  if (!profile) return false;

  return (
    profile.person_id === person.id ||
    profile.is_admin ||
    person.created_by === profile.id
  );
}

/** עדכון תאריך פטירה — מנהל מערכת בלבד */
export async function canSetDeathDate(): Promise<boolean> {
  if (await verifyAdminSession()) return true;
  const profile = await getProfile();
  return Boolean(profile?.is_admin);
}
