import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { displayBirthDates } from "@/lib/hebrew-date";
import type { Person } from "@/lib/types";

export function PersonCard({
  person,
  familyPhotoUrl,
}: {
  person: Person;
  familyPhotoUrl?: string | null;
}) {
  const dates = displayBirthDates(person.birth_date_gregorian, person.birth_date_hebrew);

  return (
    <Link href={`/person/${person.id}`} className="group block">
      <Card className="h-full overflow-hidden">
        <div className="h-1 bg-gradient-to-l from-[#8b6914] via-[#c4a055] to-[#e8d5a3] opacity-80 transition-opacity group-hover:opacity-100" />
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <Avatar name={person.full_name} photoUrl={person.photo_url} size="lg" />
          {familyPhotoUrl && (
            <div className="w-full overflow-hidden rounded-xl border border-[#c4a055]/20">
              <Image
                src={familyPhotoUrl}
                alt={`תמונה משפחתית — ${person.full_name}`}
                width={200}
                height={120}
                className="h-20 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            </div>
          )}
          <div>
            <h3 className="font-display font-semibold text-[#1a1714] group-hover:text-[#8b6914]">
              {person.full_name}
            </h3>
            {person.nickname && (
              <p className="text-sm text-stone-500">&quot;{person.nickname}&quot;</p>
            )}
          </div>
          <Badge>דור {person.generation}</Badge>
          {dates.gregorian && <p className="text-sm text-stone-600">{dates.gregorian}</p>}
          {dates.hebrew && <p className="text-xs text-stone-400">{dates.hebrew}</p>}
          {person.residence && <p className="text-sm text-stone-500">{person.residence}</p>}
          {person.phone && (
            <a
              href={`tel:${person.phone}`}
              className="text-sm text-[#8b6914] hover:underline"
              dir="ltr"
              onClick={(e) => e.stopPropagation()}
            >
              {person.phone}
            </a>
          )}
          {person.email && (
            <a
              href={`mailto:${person.email}`}
              className="text-sm text-[#8b6914] hover:underline"
              dir="ltr"
              onClick={(e) => e.stopPropagation()}
            >
              {person.email}
            </a>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
