import { notFound, redirect } from "next/navigation";
import { addChildAction } from "@/app/actions/family";
import { getPerson, getProfile } from "@/lib/data";
import { PersonForm } from "@/components/person/PersonForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AddChildPage({ params }: PageProps) {
  const { id } = await params;
  const parent = await getPerson(id);
  if (!parent) notFound();

  const profile = await getProfile();
  const canEdit =
    profile?.person_id === parent.id ||
    profile?.is_admin ||
    parent.created_by === profile?.id;

  if (!canEdit) redirect(`/person/${id}`);

  const boundAddChild = addChildAction.bind(null, parent.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">הוספת ילד/ה</h2>
        <p className="text-stone-600">הורה: {parent.full_name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי הילד/ה</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            initial={{ parent_id: parent.id }}
            onSubmit={boundAddChild}
            submitLabel="הוסף לעץ"
          />
        </CardContent>
      </Card>
    </div>
  );
}
