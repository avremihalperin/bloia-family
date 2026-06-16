"use client";

import { useMemo, useState } from "react";
import type { Person } from "@/lib/types";
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
  const options = useMemo(
    () =>
      people
        .filter((p) => p.id !== person.id)
        .slice()
        .sort((a, b) => (a.generation ?? 0) - (b.generation ?? 0) || a.full_name.localeCompare(b.full_name, "he")),
    [people, person.id]
  );

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>בן/בת זוג בעץ</Label>
        <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">ללא</option>
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
        <Button type="button" variant="outline" onClick={handleUnlink} disabled={loading || !person.spouse_id}>
          הסר קישור
        </Button>
      </div>

      {message && <p className="text-sm text-amber-800">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

