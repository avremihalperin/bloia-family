import { createGen1Person, createGen2Person, linkSpouses, unlinkSpouses } from "@/app/actions/family";
import { getAdminMessages } from "@/app/actions/messages";
import { getBranches, getPeople } from "@/lib/data";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdminSeedClient } from "./AdminSeedClient";
import { AdminInvitesClient } from "./AdminInvitesClient";
import { BranchPhotosClient } from "./BranchPhotosClient";
import { AdminFamilyPasswordClient } from "./AdminFamilyPasswordClient";
import { AdminMessagesClient } from "./AdminMessagesClient";

export default async function AdminSeedPage() {
  const people = await getPeople();
  const branches = await getBranches();
  const messages = await getAdminMessages();
  const gen1 = people.filter((p) => p.generation === 1);
  const gen2 = people.filter((p) => p.generation === 2);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-4">
      <PageHeader
        title="ניהול עץ המשפחה"
        subtitle="הזנת דור 1-2 ויצירת קישורי הזמנה — גישה למנהל בלבד"
      />

      <AdminMessagesClient messages={messages} />

      <AdminSeedClient
        people={people}
        gen1People={gen1}
        gen2People={gen2}
        onCreateGen1={createGen1Person}
        onCreateGen2={createGen2Person}
        onLinkSpouses={linkSpouses}
        onUnlinkSpouses={unlinkSpouses}
      />
      <BranchPhotosClient branches={branches} gen2People={gen2} />
      <AdminFamilyPasswordClient />
      <AdminInvitesClient people={people} baseUrl={baseUrl} />
    </div>
  );
}
