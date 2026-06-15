import { Suspense } from "react";
import { getBranches, getPeople } from "@/lib/data";
import { buildTree, filterTreeByBranch } from "@/lib/tree-builder";
import { FamilyTree } from "@/components/tree/FamilyTree";
import { SearchBar } from "@/components/search/SearchBar";

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

  const tree = buildTree(people);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900">עץ משפחה</h2>
        <p className="text-stone-600">תצוגה היררכית — השתמשו ב-+/- לזום</p>
      </div>

      <Suspense fallback={<div>טוען...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      {tree.length === 0 ? (
        <p className="rounded-xl border border-amber-100 bg-white p-8 text-center text-stone-500">
          אין עדיין נתונים בעץ. הוסף דור 1 ו-2 בדף הניהול.
        </p>
      ) : (
        <FamilyTree nodes={tree} />
      )}
    </div>
  );
}
