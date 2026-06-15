import { createGen1Person, createGen2Person, linkSpouses } from "@/app/actions/family";
import { getBranches, getPeople } from "@/lib/data";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdminSeedClient } from "./AdminSeedClient";
import { AdminInvitesClient } from "./AdminInvitesClient";
import { BranchPhotosClient } from "./BranchPhotosClient";
import { AdminFamilyPasswordClient } from "./AdminFamilyPasswordClient";

export default async function AdminSeedPage() {
  const people = await getPeople();
  const branches = await getBranches();
  const gen1 = people.filter((p) => p.generation === 1);
  const gen2 = people.filter((p) => p.generation === 2);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-8">
      <PageHeader
        title="ניהול עץ המשפחה"
        subtitle="הזנת דור 1-2 ויצירת קישורי הזמנה — גישה למנהל בלבד"
      />

      <AdminSeedClient
        gen1People={gen1}
        gen2People={gen2}
        onCreateGen1={createGen1Person}
        onCreateGen2={createGen2Person}
        onLinkSpouses={linkSpouses}
      />
      <BranchPhotosClient branches={branches} gen2People={gen2} />
      <AdminFamilyPasswordClient />
      <AdminInvitesClient people={people} baseUrl={baseUrl} />
    </div>
  );
}
