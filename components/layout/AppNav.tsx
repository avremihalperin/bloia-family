import { verifyAdminSession } from "@/lib/admin-session";
import { getAppSettings } from "@/lib/data";
import { clearFamilySession } from "@/lib/family-session";
import { NavBarClient } from "./NavBarClient";

async function logoutAction() {
  "use server";
  await clearFamilySession();
}

export async function AppNav() {
  const settings = await getAppSettings().catch(() => null);
  const isAdmin = await verifyAdminSession();

  return (
    <NavBarClient
      treeName={settings?.tree_name || "עץ המשפחה"}
      isAdmin={isAdmin}
      logoutAction={logoutAction}
    />
  );
}
