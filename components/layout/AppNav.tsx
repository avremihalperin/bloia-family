import { verifyAdminSession } from "@/lib/admin-session";
import { getAppSettings, getPerson, getProfile } from "@/lib/data";
import { clearFamilySession } from "@/lib/family-session";
import { NavBarClient } from "./NavBarClient";

async function logoutAction() {
  "use server";
  await clearFamilySession();
}

export async function AppNav() {
  const settings = await getAppSettings().catch(() => null);
  const isAdmin = await verifyAdminSession();
  const profile = await getProfile();
  const linkedPerson = profile?.person_id ? await getPerson(profile.person_id) : null;

  return (
    <NavBarClient
      treeName={settings?.tree_name || "עץ המשפחה"}
      isAdmin={isAdmin}
      logoutAction={logoutAction}
      defaultSenderName={linkedPerson?.full_name || ""}
    />
  );
}
