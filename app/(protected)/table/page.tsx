import { Suspense } from "react";
import { getBranches, getPeople } from "@/lib/data";
import { PeopleTable } from "@/components/table/PeopleTable";
import { SearchBar } from "@/components/search/SearchBar";

interface PageProps {
  searchParams: Promise<{ branch?: string; gen?: string; q?: string }>;
}

export default async function TablePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const branches = await getBranches();
  const people = await getPeople({
    branchId: params.branch || null,
    generation: params.gen ? Number(params.gen) : null,
    query: params.q || null,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900">טבלת משפחה</h2>
        <p className="text-stone-600">מיון, סינון וייצוא CSV</p>
      </div>

      <Suspense fallback={<div>טוען...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      <PeopleTable people={people} branches={branches} />
    </div>
  );
}
