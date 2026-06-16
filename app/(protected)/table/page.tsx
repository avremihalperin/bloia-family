import { Suspense } from "react";
import { getBranches, getPeople } from "@/lib/data";
import { PeopleTable } from "@/components/table/PeopleTable";
import { BranchExcelPanel } from "@/components/table/BranchExcelPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { PageHeader } from "@/components/layout/PageHeader";

interface PageProps {
  searchParams: Promise<{ branch?: string; gen?: string; q?: string }>;
}

export default async function TablePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const branches = await getBranches();
  const allPeople = await getPeople();
  const people = await getPeople({
    branchId: params.branch || null,
    generation: params.gen ? Number(params.gen) : null,
    query: params.q || null,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="טבלת משפחה"
        subtitle="מיון בעץ: ענף (דור 2) · חוטר (דור 3) · נצר (דור 4)"
      />

      <Suspense fallback={<div>טוען...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      <BranchExcelPanel
        branches={branches}
        people={allPeople}
        initialBranchId={params.branch}
      />

      <PeopleTable people={people} branches={branches} />
    </div>
  );
}
