import { notFound, redirect } from "next/navigation";
import { addSiblingAction } from "@/app/actions/family";
import { getPerson } from "@/lib/data";
import { canEditPerson } from "@/lib/permissions";
import { PersonForm } from "@/components/person/PersonForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonFormData } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AddSiblingPage({ params }: PageProps) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  if (!(await canEditPerson(person))) redirect(`/person/${id}`);

  if (!person.parent_id) {
    redirect(`/person/${id}/set-parent`);
  }

  async function handleAddSibling(data: PersonFormData, photoFile?: File | null) {
    "use server";
    await addSiblingAction(person!.id, data, photoFile);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">הוספת אח/אחות</h2>
        <p className="text-stone-600">
          אח/אחות של {person.full_name} — אותו הורה בעץ
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטים אישיים</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            initial={{ parent_id: person.parent_id }}
            resetOnSuccess
            onSubmit={handleAddSibling}
            submitLabel="הוסף לעץ"
          />
        </CardContent>
      </Card>
    </div>
  );
}
