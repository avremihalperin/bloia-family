import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBranch, getChildren, getPerson } from "@/lib/data";
import { verifyAdminSession } from "@/lib/admin-session";
import { canEditPerson } from "@/lib/permissions";
import { displayBirthDates } from "@/lib/hebrew-date";
import { genderHeadingClasses, genderLinkClasses, genderRowClasses } from "@/lib/gender-colors";
import {
  formatDisplayName,
  genderLabel,
  getSpouseName,
  maritalStatusLabel,
} from "@/lib/person-display";
import { EditPersonButton } from "@/components/person/EditPersonButton";
import { BranchPhotoUpload } from "@/components/person/BranchPhotoUpload";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PersonPage({ params }: PageProps) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  const children = await getChildren(id);
  const spouse = person.spouse_id ? await getPerson(person.spouse_id) : null;
  const parent1 = person.parent_id ? await getPerson(person.parent_id) : null;
  const parent2 = person.parent2_id
    ? await getPerson(person.parent2_id)
    : parent1?.spouse_id && parent1.spouse_id !== person.parent_id
      ? await getPerson(parent1.spouse_id)
      : null;
  const hasAdminSession = await verifyAdminSession();
  const branch = person.branch_id ? await getBranch(person.branch_id) : null;
  const dates = displayBirthDates(person.birth_date_gregorian, person.birth_date_hebrew);
  const canEdit = await canEditPerson(person);
  const displayName = formatDisplayName(person, "full");
  const spouseName = getSpouseName(person, spouse);
  const parentRecords = [parent1, parent2].filter(
    (p, i, arr): p is NonNullable<typeof parent1> =>
      Boolean(p) && arr.findIndex((x) => x?.id === p?.id) === i
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={person.full_name} photoUrl={person.photo_url} size="lg" gender={person.gender} />
          <div>
            <h2 className={genderHeadingClasses(person.gender, "font-display text-2xl font-bold")}>
              {displayName}
            </h2>
            {person.nickname && (
              <p className="text-stone-500">&quot;{person.nickname}&quot;</p>
            )}
            {person.maiden_name && (
              <p className="text-stone-500">שם נעורים: {person.maiden_name}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>דור {person.generation}</Badge>
              {person.family_position && (
                <Badge>מיקום בילדים: {person.family_position}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && <EditPersonButton personId={person.id} />}
          <Link href="/tree">
            <Button variant="outline">חזרה לעץ</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>פרטים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {dates.gregorian && <p><strong>תאריך לידה (לועזי):</strong> {dates.gregorian}</p>}
            {dates.hebrew && <p><strong>תאריך לידה (עברי):</strong> {dates.hebrew}</p>}
            {person.residence && <p><strong>מגורים:</strong> {person.residence}</p>}
            {person.phone && (
              <p>
                <strong>טלפון:</strong>{" "}
                <a href={`tel:${person.phone}`} className="text-amber-800 hover:underline" dir="ltr">
                  {person.phone}
                </a>
              </p>
            )}
            {person.email && (
              <p>
                <strong>דוא&quot;ל:</strong>{" "}
                <a href={`mailto:${person.email}`} className="text-amber-800 hover:underline" dir="ltr">
                  {person.email}
                </a>
              </p>
            )}
            {maritalStatusLabel(person.marital_status, person.gender) && (
              <p>
                <strong>מצב משפחתי:</strong>{" "}
                {maritalStatusLabel(person.marital_status, person.gender)}
              </p>
            )}
            {genderLabel(person.gender) && (
              <p><strong>מגדר:</strong> {genderLabel(person.gender)}</p>
            )}
            {parentRecords.length > 0 && (
              <p>
                <strong>הורים:</strong>{" "}
                {parentRecords.map((p, i) => (
                  <span key={p.id}>
                    <Link href={`/person/${p.id}`} className="text-amber-800 hover:underline">
                      {formatDisplayName(p, "short")}
                    </Link>
                    {i < parentRecords.length - 1 ? " ו" : ""}
                  </span>
                ))}
              </p>
            )}
            {spouseName && person.marital_status === "married" && (
              <p>
                <strong>{person.gender === "female" ? "בן זוג:" : "בת זוג:"}</strong>{" "}
                {spouse ? (
                  <Link href={`/person/${spouse.id}`} className="text-amber-800 hover:underline">
                    {spouseName}
                  </Link>
                ) : (
                  spouseName
                )}
              </p>
            )}
            {branch?.photo_url && (
              <div className="pt-2">
                <p className="mb-2 font-semibold">תמונה משפחתית</p>
                <Image
                  src={branch.photo_url}
                  alt={`תמונה משפחתית — ${person.full_name}`}
                  width={240}
                  height={160}
                  className="rounded-lg object-cover"
                  unoptimized
                />
              </div>
            )}
          </CardContent>
        </Card>

        {branch && hasAdminSession && (
          <Card>
            <CardHeader>
              <CardTitle>תמונה משפחתית</CardTitle>
            </CardHeader>
            <CardContent>
              <BranchPhotoUpload
                branchId={branch.id}
                label={person.full_name}
                currentPhoto={branch.photo_url}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ילדים ({children.length})</CardTitle>
          {canEdit && (
            <Link href={`/person/${person.id}/add-child`}>
              <Button size="sm">הוסף ילד/ה</Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <p className="text-stone-500">אין ילדים רשומים</p>
          ) : (
            <div className="space-y-2">
              {children.map((child) => (
                <div
                  key={child.id}
                  className={genderRowClasses(child.gender, "flex items-center justify-between gap-3")}
                >
                  <Link href={`/person/${child.id}`} className={genderLinkClasses(child.gender)}>
                    {formatDisplayName(child, "short")}
                  </Link>
                  {canEdit && <EditPersonButton personId={child.id} />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
