import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { setParentAction } from "@/app/actions/family";
import { getPeople, getPerson } from "@/lib/data";
import { parentCandidates, parentCoupleOptions } from "@/lib/parents";
import { canEditPerson } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SetParentPage({ params }: PageProps) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  if (!(await canEditPerson(person))) redirect(`/person/${id}`);

  const people = await getPeople();
  const parentOptions = parentCoupleOptions(parentCandidates(people, person));

  async function handleSetParent(formData: FormData) {
    "use server";
    const parentId = String(formData.get("parent_id") || "");
    if (!parentId) throw new Error("נא לבחור הורה");
    await setParentAction(id, parentId);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">קישור להורה</h2>
          <p className="text-stone-600">{person.full_name}</p>
        </div>
        <Link href={`/person/${person.id}`}>
          <Button variant="outline">ביטול</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>בחר הורה בעץ</CardTitle>
        </CardHeader>
        <CardContent>
          {parentOptions.length === 0 ? (
            <p className="text-sm text-amber-800">
              אין מועמדים להורה. הוסף קודם אדם בדור קודם בדף הניהול.
            </p>
          ) : (
            <form action={handleSetParent} className="space-y-4">
              <div>
                <Label htmlFor="parent_id">הורה / זוג הורים</Label>
                <Select
                  id="parent_id"
                  name="parent_id"
                  defaultValue={person.parent_id || ""}
                  required
                >
                  <option value="">בחר הורה</option>
                  {parentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                <p className="mt-1 text-xs text-stone-500">
                  אם בחרת זוג מקושר, שני ההורים ישויכו אוטומטית
                </p>
              </div>
              <Button type="submit">שמור קישור</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
