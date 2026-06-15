import { Suspense } from "react";
import { getBranches, getPeople } from "@/lib/data";
import { PeopleTable } from "@/components/table/PeopleTable";
import { SearchBar } from "@/components/search/SearchBar";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <div className="space-y-8">
      <PageHeader title="טבלת משפחה" subtitle="מיון, סינון וייצוא CSV" />

      <Suspense fallback={<div>טוען...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      <PeopleTable people={people} branches={branches} />
    </div>
  );
}
