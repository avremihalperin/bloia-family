"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Person } from "@/lib/types";
import { formatDisplayName } from "@/lib/person-display";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function SpouseLinker({
  person,
  people,
  onLink,
  onUnlink,
}: {
  person: Person;
  people: Person[];
  onLink: (spouseId: string) => Promise<void>;
  onUnlink: () => Promise<void>;
}) {
  const router = useRouter();
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const options = useMemo(
    () =>
      people
        .filter((p) => p.id !== person.id)
        .slice()
        .sort(
          (a, b) =>
            (a.generation ?? 0) - (b.generation ?? 0) ||
            a.full_name.localeCompare(b.full_name, "he")
        ),
    [people, person.id]
  );

  const linkedSpouse = person.spouse_id ? byId.get(person.spouse_id) : null;

  const [selected, setSelected] = useState(person.spouse_id || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLink = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await onLink(selected);
      setMessage("הקישור נשמר בהצלחה");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await onUnlink();
      setSelected("");
      setMessage("הקישור הוסר בהצלחה");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
      <div>
        <p className="text-sm font-medium text-stone-800">קישור או הוספת בן/בת זוג</p>
        <p className="mt-1 text-xs text-stone-500">
          בחרו פרופיל קיים מהעץ, או הוסיפו פרופיל חדש לבן/בת הזוג
        </p>
      </div>

      {linkedSpouse ? (
        <p className="text-sm text-stone-600">
          <strong>בן/בת זוג נוכחי/ת:</strong>{" "}
          <Link href={`/person/${linkedSpouse.id}`} className="text-[#8b6914] hover:underline">
            {formatDisplayName(linkedSpouse, "short")}
          </Link>
        </p>
      ) : (
        <p className="text-sm text-amber-800">לא מקושר/ת לבן/בת זוג בעץ</p>
      )}

      <div>
        <Label>קשר פרופיל קיים מהעץ</Label>
        <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">בחר בן/בת זוג</option>
          {options.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name} (דור {p.generation ?? "?"})
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleLink} disabled={loading || !selected}>
          {loading ? "שומר..." : "שמור קישור"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleUnlink}
          disabled={loading || !person.spouse_id}
        >
          הסר קישור
        </Button>
        <Link href={`/person/${person.id}/add-spouse`}>
          <Button type="button" variant="outline">
            הוסף פרופיל חדש
          </Button>
        </Link>
      </div>

      {message && <p className="text-sm text-amber-800">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
