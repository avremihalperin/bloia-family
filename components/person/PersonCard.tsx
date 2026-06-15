import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { displayBirthDates } from "@/lib/hebrew-date";
import type { Person } from "@/lib/types";

export function PersonCard({ person }: { person: Person }) {
  const dates = displayBirthDates(person.birth_date_gregorian, person.birth_date_hebrew);

  return (
    <Link href={`/person/${person.id}`}>
      <Card className="transition hover:shadow-md">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <Avatar name={person.full_name} photoUrl={person.photo_url} size="lg" />
          <div>
            <h3 className="font-semibold">{person.full_name}</h3>
            {person.nickname && (
              <p className="text-sm text-stone-500">&quot;{person.nickname}&quot;</p>
            )}
          </div>
          <Badge>דור {person.generation}</Badge>
          {dates.gregorian && <p className="text-sm">{dates.gregorian}</p>}
          {dates.hebrew && <p className="text-xs text-stone-500">{dates.hebrew}</p>}
          {person.residence && <p className="text-sm text-stone-600">{person.residence}</p>}
          {person.phone && (
            <a href={`tel:${person.phone}`} className="text-sm text-amber-800 hover:underline" dir="ltr">
              {person.phone}
            </a>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
