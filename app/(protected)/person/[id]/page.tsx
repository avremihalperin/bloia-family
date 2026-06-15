import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { updatePersonAction } from "@/app/actions/family";
import { getBranch, getChildren, getPerson, getProfile } from "@/lib/data";
import { verifyAdminSession } from "@/lib/admin-session";
import { displayBirthDates } from "@/lib/hebrew-date";
import { PersonForm } from "@/components/person/PersonForm";
import { PhotoUpload } from "@/components/person/PhotoUpload";
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
  const profile = await getProfile();
  const hasAdminSession = await verifyAdminSession();
  const branch = person.branch_id ? await getBranch(person.branch_id) : null;
  const dates = displayBirthDates(person.birth_date_gregorian, person.birth_date_hebrew);

  const canEdit =
    profile?.person_id === person.id ||
    profile?.is_admin ||
    person.created_by === profile?.id;

  const canUploadPhoto = canEdit || hasAdminSession;

  const boundUpdate = updatePersonAction.bind(null, person.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={person.full_name} photoUrl={person.photo_url} size="lg" />
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1a1714]">{person.full_name}</h2>
            {person.nickname && (
              <p className="text-stone-500">&quot;{person.nickname}&quot;</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>דור {person.generation}</Badge>
              {person.family_position && <Badge>{person.family_position}</Badge>}
            </div>
          </div>
        </div>
        <Link href="/tree">
          <Button variant="outline">חזרה לעץ</Button>
        </Link>
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
            {person.gender && <p><strong>מגדר:</strong> {person.gender}</p>}
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

        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle>עריכת פרופיל</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {canUploadPhoto && (
                <PhotoUpload
                  personId={person.id}
                  name={person.full_name}
                  currentPhoto={person.photo_url}
                />
              )}
              <PersonForm initial={person} onSubmit={boundUpdate} showPhoto={false} />
            </CardContent>
          </Card>
        )}

        {!canEdit && canUploadPhoto && (
          <Card>
            <CardHeader>
              <CardTitle>תמונה אישית</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                personId={person.id}
                name={person.full_name}
                currentPhoto={person.photo_url}
              />
            </CardContent>
          </Card>
        )}

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
                <Link
                  key={child.id}
                  href={`/person/${child.id}`}
                  className="block rounded-xl border border-[#c4a055]/15 bg-white/60 px-4 py-3 transition-all hover:border-[#c4a055]/35 hover:bg-white hover:shadow-md"
                >
                  {child.full_name}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
