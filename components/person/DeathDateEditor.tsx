"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gregorianToHebrew } from "@/lib/hebrew-date";
import type { Person } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeathDateEditorProps {
  person: Person;
  onSave: (data: {
    death_date_gregorian: string | null;
    death_date_hebrew: string | null;
  }) => Promise<void>;
}

export function DeathDateEditor({ person, onSave }: DeathDateEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [gregorian, setGregorian] = useState(person.death_date_gregorian || "");
  const [hebrewPreview, setHebrewPreview] = useState(
    person.death_date_hebrew || gregorianToHebrew(person.death_date_gregorian) || ""
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const form = new FormData(e.currentTarget);
    const deathGregorian = String(form.get("death_date_gregorian") || "").trim();
    const deathHebrew = String(form.get("death_date_hebrew") || "").trim();

    try {
      await onSave({
        death_date_gregorian: deathGregorian || null,
        death_date_hebrew: deathHebrew || null,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await onSave({ death_date_gregorian: null, death_date_hebrew: null });
      setGregorian("");
      setHebrewPreview("");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה במחיקה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor="death_date_gregorian">תאריך פטירה (לועזי)</Label>
        <Input
          id="death_date_gregorian"
          name="death_date_gregorian"
          type="date"
          value={gregorian}
          onChange={(e) => {
            setGregorian(e.target.value);
            setHebrewPreview(gregorianToHebrew(e.target.value) || "");
          }}
        />
      </div>

      <div>
        <Label htmlFor="death_date_hebrew">תאריך פטירה (עברי, אותיות)</Label>
        <Input
          id="death_date_hebrew"
          name="death_date_hebrew"
          defaultValue={person.death_date_hebrew || ""}
          placeholder={hebrewPreview || "כ״ג תמוז תשמ״ה"}
        />
        {hebrewPreview && !person.death_date_hebrew && (
          <p className="mt-1 text-xs text-stone-500">חישוב אוטומטי: {hebrewPreview}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-emerald-700 md:col-span-2">נשמר בהצלחה</p>
      )}

      <div className="flex flex-wrap gap-2 md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "שומר..." : "שמור תאריך פטירה"}
        </Button>
        {(person.death_date_gregorian || person.death_date_hebrew) && (
          <Button type="button" variant="outline" disabled={loading} onClick={handleClear}>
            נקה תאריך
          </Button>
        )}
      </div>
    </form>
  );
}
