import { Suspense } from "react";
import { verifyAdminSession } from "@/lib/admin-session";
import { verifyFamilySession } from "@/lib/family-session";
import { getBranches, getPeople } from "@/lib/data";
import { canEditPerson } from "@/lib/permissions";
import { buildTree, filterTreeByBranch } from "@/lib/tree-builder";
import { FamilyTree } from "@/components/tree/FamilyTree";
import { SearchBar } from "@/components/search/SearchBar";
import { PageHeader } from "@/components/layout/PageHeader";

interface PageProps {
  searchParams: Promise<{ branch?: string; gen?: string; q?: string }>;
}

export default async function TreePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const branches = await getBranches();
  let people = await getPeople({
    branchId: params.branch || null,
    generation: params.gen ? Number(params.gen) : null,
    query: params.q || null,
  });

  if (params.branch) {
    people = filterTreeByBranch(people, params.branch);
  }

  const tree = buildTree(people, branches);

  const isGlobalEditor =
    (await verifyAdminSession()) || (await verifyFamilySession());
  const editableIds = isGlobalEditor
    ? people.map((p) => p.id)
    : (
        await Promise.all(
          people.map(async (p) => ((await canEditPerson(p)) ? p.id : null))
        )
      ).filter((id): id is string => Boolean(id));

  return (
    <div className="space-y-8">
      <PageHeader title="עץ משפחה" subtitle="תצוגה היררכית — השתמשו ב-+/- לזום" />

      <Suspense fallback={<div>טוען...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      {tree.length === 0 ? (
        <p className="glass-card rounded-2xl p-10 text-center text-stone-500">
          אין עדיין נתונים בעץ. הוסף דור 1 ו-2 בדף הניהול.
        </p>
      ) : (
        <FamilyTree nodes={tree} editableIds={editableIds} />
      )}
    </div>
  );
}
