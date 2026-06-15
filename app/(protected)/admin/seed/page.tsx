import { createGen1Person, createGen2Person, linkSpouses } from "@/app/actions/family";
import { getPeople } from "@/lib/data";
import { AdminSeedClient } from "./AdminSeedClient";
import { AdminInvitesClient } from "./AdminInvitesClient";

export default async function AdminSeedPage() {
  const people = await getPeople();
  const gen1 = people.filter((p) => p.generation === 1);
  const gen2 = people.filter((p) => p.generation === 2);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900">ניהול עץ המשפחה</h2>
        <p className="text-stone-600">הזנת דור 1-2 ויצירת קישורי הזמנה — גישה למנהל בלבד</p>
      </div>

      <AdminSeedClient
        gen1People={gen1}
        gen2People={gen2}
        onCreateGen1={createGen1Person}
        onCreateGen2={createGen2Person}
        onLinkSpouses={linkSpouses}
      />
      <AdminInvitesClient people={people} baseUrl={baseUrl} />
    </div>
  );
}
