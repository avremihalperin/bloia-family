import { Suspense } from "react";
import { getBranches, getPeople } from "@/lib/data";
import { PersonCard } from "@/components/person/PersonCard";
import { SearchBar } from "@/components/search/SearchBar";

interface PageProps {
  searchParams: Promise<{ branch?: string; gen?: string; q?: string }>;
}

export default async function CardsPage({ searchParams }: PageProps) {
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
        <h2 className="text-2xl font-bold text-amber-900">כרטיסי משפחה</h2>
        <p className="text-stone-600">תצוגת גריד עם תמונות</p>
      </div>

      <Suspense fallback={<div>טוען...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}
