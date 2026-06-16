"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Person } from "@/lib/types";
import { parentCandidates, parentCoupleOptions } from "@/lib/parents";
import { formatDisplayName } from "@/lib/person-display";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function ParentLinker({
  person,
  people,
  onLink,
  onUnlink,
}: {
  person: Person;
  people: Person[];
  onLink: (parentId: string) => Promise<void>;
  onUnlink: () => Promise<void>;
}) {
  const router = useRouter();
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const options = useMemo(
    () => parentCoupleOptions(parentCandidates(people, person)),
    [people, person]
  );

  const parent1 = person.parent_id ? byId.get(person.parent_id) : null;
  const parent2 = person.parent2_id
    ? byId.get(person.parent2_id)
    : parent1?.spouse_id
      ? byId.get(parent1.spouse_id)
      : null;

  const parentRecords = [parent1, parent2].filter(
    (p, i, arr): p is Person =>
      Boolean(p) && arr.findIndex((x) => x?.id === p?.id) === i
  );

  const [selected, setSelected] = useState(person.parent_id || "");
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
      setMessage("ההורים קושרו בהצלחה");
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
      setMessage("קישור ההורים הוסר");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {parentRecords.length > 0 ? (
        <p className="text-sm text-stone-600">
          <strong>הורים נוכחיים:</strong>{" "}
          {parentRecords.map((p, i) => (
            <span key={p.id}>
              <Link href={`/person/${p.id}`} className="text-[#8b6914] hover:underline">
                {formatDisplayName(p, "short")}
              </Link>
              {i < parentRecords.length - 1 ? " ו" : ""}
            </span>
          ))}
        </p>
      ) : (
        <p className="text-sm text-amber-800">לא משויך להורים בעץ</p>
      )}

      {options.length === 0 ? (
        <p className="text-sm text-stone-500">
          אין מועמדים להורה. הוסף קודם אנשים בדור הקודם.
        </p>
      ) : (
        <div>
          <Label>זוג הורים / הורה בעץ</Label>
          <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">בחר הורה</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-stone-500">
            אם בחרת זוג מקושר, שני ההורים ישויכו אוטומטית
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleLink} disabled={loading || !selected}>
          {loading ? "שומר..." : "שמור קישור"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleUnlink}
          disabled={loading || !person.parent_id}
        >
          הסר קישור
        </Button>
      </div>

      {message && <p className="text-sm text-amber-800">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
