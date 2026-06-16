import { notFound, redirect } from "next/navigation";
import { addChildAction } from "@/app/actions/family";
import { getPerson } from "@/lib/data";
import { canEditPerson } from "@/lib/permissions";
import { PersonForm } from "@/components/person/PersonForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonFormData } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AddChildPage({ params }: PageProps) {
  const { id } = await params;
  const parent = await getPerson(id);
  if (!parent) notFound();

  if (!(await canEditPerson(parent))) redirect(`/person/${id}`);

  async function handleAddChild(data: PersonFormData, photoFile?: File | null) {
    "use server";
    await addChildAction(parent!.id, data, photoFile);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">הוספת ילד/ה</h2>
        <p className="text-stone-600">הורה: {parent.full_name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטים אישיים</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            initial={{ parent_id: parent.id }}
            onSubmit={handleAddChild}
            submitLabel="הוסף לעץ"
          />
        </CardContent>
      </Card>
    </div>
  );
}
