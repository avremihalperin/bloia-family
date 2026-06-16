import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { linkSpouses, unlinkSpouses, linkParentAction, clearParentAction, updatePerson, uploadPhotoForNewPerson } from "@/app/actions/family";
import { ParentLinker } from "@/components/person/ParentLinker";
import { getPeople, getPerson } from "@/lib/data";
import { canEditPerson } from "@/lib/permissions";
import { PersonForm } from "@/components/person/PersonForm";
import { PhotoUpload } from "@/components/person/PhotoUpload";
import { SpouseLinker } from "@/components/person/SpouseLinker";
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

      <Card id="spouse">
        <CardHeader>
          <CardTitle>קישור בן/בת זוג</CardTitle>
        </CardHeader>
        <CardContent>
          <SpouseLinker
            person={person}
            people={people}
            onLink={handleLinkSpouse}
            onUnlink={handleUnlinkSpouse}
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
            onSubmit={handleUpdate}
            submitLabel="שמור שינויים"
            showPhoto={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
