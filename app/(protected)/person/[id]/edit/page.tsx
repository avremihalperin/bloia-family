import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { linkSpouses, unlinkSpouses, linkParentAction, clearParentAction, updatePerson, updateDeathDateAction, uploadPhotoForNewPerson } from "@/app/actions/family";
import { ParentLinker } from "@/components/person/ParentLinker";
import { DeathDateEditor } from "@/components/person/DeathDateEditor";
import { getPeople, getPerson } from "@/lib/data";
import { canEditPerson, canSetDeathDate } from "@/lib/permissions";
import { PersonForm } from "@/components/person/PersonForm";
import { PhotoUpload } from "@/components/person/PhotoUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonFormData } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPersonPage({ params }: PageProps) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  if (!(await canEditPerson(person))) {
    redirect(`/person/${id}`);
  }

  const people = await getPeople();
  const showDeathDate = await canSetDeathDate();

  async function handleUpdate(data: PersonFormData, photoFile?: File | null) {
    "use server";
    await updatePerson(id, data);
    if (photoFile) await uploadPhotoForNewPerson(id, photoFile);
    redirect(`/person/${id}`);
  }

  async function handleLinkSpouse(spouseId: string) {
    "use server";
    await linkSpouses(id, spouseId);
  }

  async function handleClearParent() {
    "use server";
    await clearParentAction(id);
  }

  async function handleLinkParent(parentId: string) {
    "use server";
    await linkParentAction(id, parentId);
  }

  async function handleUnlinkSpouse() {
    "use server";
    await unlinkSpouses(id);
  }

  async function handleDeathDate(data: {
    death_date_gregorian: string | null;
    death_date_hebrew: string | null;
  }) {
    "use server";
    await updateDeathDateAction(id, data);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1a1714]">עריכת פרטים</h2>
          <p className="text-stone-600">{person.full_name}</p>
        </div>
        <Link href={`/person/${person.id}`}>
          <Button variant="outline">ביטול</Button>
        </Link>
      </div>

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

      <Card id="parents">
        <CardHeader>
          <CardTitle>קישור להורים</CardTitle>
        </CardHeader>
        <CardContent>
          <ParentLinker
            person={person}
            people={people}
            onLink={handleLinkParent}
            onUnlink={handleClearParent}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>פרטים אישיים</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            initial={person}
            people={people}
            onLinkSpouse={handleLinkSpouse}
            onUnlinkSpouse={handleUnlinkSpouse}
            onSubmit={handleUpdate}
            submitLabel="שמור שינויים"
            showPhoto={false}
          />
        </CardContent>
      </Card>

      {showDeathDate && (
        <Card id="death">
          <CardHeader>
            <CardTitle>תאריך פטירה</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-stone-500">
              שדה זה זמין למנהל בלבד. משמש לתצוגת יארצייט בלוח האירועים.
            </p>
            <DeathDateEditor person={person} onSave={handleDeathDate} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
