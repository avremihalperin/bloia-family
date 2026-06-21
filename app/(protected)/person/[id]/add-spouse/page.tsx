import { notFound, redirect } from "next/navigation";
import { addSpouseAction } from "@/app/actions/family";
import { getPerson } from "@/lib/data";
import { canEditPerson } from "@/lib/permissions";
import { PersonForm } from "@/components/person/PersonForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonFormData } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AddSpousePage({ params }: PageProps) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  if (!(await canEditPerson(person))) redirect(`/person/${id}`);

  async function handleAddSpouse(data: PersonFormData, photoFile?: File | null) {
    "use server";
    await addSpouseAction(person!.id, data, photoFile);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">הוספת בן/בת זוג</h2>
        <p className="text-stone-600">
          פרופיל חדש שייקשר אוטומטית ל{person.full_name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטים אישיים</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            initial={{ marital_status: "married" }}
            creatingSpouse
            onSubmit={handleAddSpouse}
            submitLabel="הוסף וקשר"
          />
        </CardContent>
      </Card>
    </div>
  );
}
