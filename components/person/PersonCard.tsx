import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EditPersonButton } from "@/components/person/EditPersonButton";
import { displayBirthDates } from "@/lib/hebrew-date";
import {
  genderNameClasses,
  genderTopBarClasses,
} from "@/lib/gender-colors";
import { formatDisplayName } from "@/lib/person-display";
import type { Person } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PersonCard({
  person,
  familyPhotoUrl,
}: {
  person: Person;
  familyPhotoUrl?: string | null;
}) {
  const dates = displayBirthDates(person.birth_date_gregorian, person.birth_date_hebrew);

  return (
    <Card className="relative h-full overflow-hidden">
      <div className="absolute left-3 top-3 z-10">
        <EditPersonButton personId={person.id} />
      </div>
      <Link href={`/person/${person.id}`} className="group block h-full">
        <div className={genderTopBarClasses(person.gender)} />
        <CardContent className="flex flex-col items-center gap-3 p-6 pt-10 text-center">
          <Avatar name={person.full_name} photoUrl={person.photo_url} size="lg" gender={person.gender} />
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
            <h3 className={cn("font-display", genderNameClasses(person.gender))}>
              {formatDisplayName(person, "short")}
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
      </Link>
    </Card>
  );
}
