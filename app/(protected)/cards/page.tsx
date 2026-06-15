import { Suspense } from "react";
import { getBranches, getPeople } from "@/lib/data";
import { PersonCard } from "@/components/person/PersonCard";
import { SearchBar } from "@/components/search/SearchBar";
import { PageHeader } from "@/components/layout/PageHeader";

interface PageProps {
  searchParams: Promise<{ branch?: string; gen?: string; q?: string }>;
}

export default async function CardsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const branches = await getBranches();
  const branchPhotoByRoot = new Map(
    branches
      .filter((b) => b.root_person_id && b.photo_url)
      .map((b) => [b.root_person_id!, b.photo_url])
  );
  const branchPhotoById = new Map(
    branches.filter((b) => b.photo_url).map((b) => [b.id, b.photo_url])
  );

  const people = await getPeople({
    branchId: params.branch || null,
    generation: params.gen ? Number(params.gen) : null,
    query: params.q || null,
  });

  return (
    <div className="space-y-8">
      <PageHeader title="כרטיסי משפחה" subtitle="תצוגת גריד עם תמונות" />

      <Suspense fallback={<div>טוען...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {people.map((person) => {
          const familyPhotoUrl =
            (person.branch_id && branchPhotoById.get(person.branch_id)) ||
            (person.generation === 2 && branchPhotoByRoot.get(person.id)) ||
            null;

          return (
            <PersonCard
              key={person.id}
              person={person}
              familyPhotoUrl={familyPhotoUrl}
            />
          );
        })}
      </div>
    </div>
  );
}
