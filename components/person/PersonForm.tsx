"use client";

import { useState } from "react";
import { gregorianToHebrew } from "@/lib/hebrew-date";
import type { Gender, Person, PersonFormData } from "@/lib/types";
import { PhotoPicker } from "@/components/person/PhotoPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface PersonFormProps {
  initial?: Partial<Person>;
  parents?: Person[];
  onSubmit: (data: PersonFormData, photoFile?: File | null) => Promise<void>;
  submitLabel?: string;
  showParentSelect?: boolean;
  showPhoto?: boolean;
}

export function PersonForm({
  initial,
  parents = [],
  onSubmit,
  submitLabel = "שמור",
  showParentSelect = false,
  showPhoto = true,
}: PersonFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [hebrewPreview, setHebrewPreview] = useState(
    initial?.birth_date_hebrew ||
      gregorianToHebrew(initial?.birth_date_gregorian) ||
      ""
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const data: PersonFormData = {
      full_name: String(form.get("full_name") || ""),
      nickname: String(form.get("nickname") || "") || undefined,
      birth_date_gregorian: String(form.get("birth_date_gregorian") || "") || undefined,
      birth_date_hebrew: String(form.get("birth_date_hebrew") || "") || undefined,
      residence: String(form.get("residence") || "") || undefined,
      phone: String(form.get("phone") || "") || undefined,
      email: String(form.get("email") || "") || undefined,
      family_position: String(form.get("family_position") || "") || undefined,
      gender: (form.get("gender") as Gender) || undefined,
      parent_id: String(form.get("parent_id") || "") || undefined,
    };

    try {
      await onSubmit(data, photoFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      {showPhoto && (
        <div className="md:col-span-2">
          <PhotoPicker
            name={initial?.full_name || "new-person"}
            label="תמונה אישית"
            currentPhoto={initial?.photo_url}
            onFileSelect={setPhotoFile}
          />
        </div>
      )}

      <div className="md:col-span-2">
        <Label htmlFor="full_name">שם מלא *</Label>
        <Input id="full_name" name="full_name" defaultValue={initial?.full_name} required />
      </div>

      <div>
        <Label htmlFor="nickname">כינוי</Label>
        <Input id="nickname" name="nickname" defaultValue={initial?.nickname || ""} />
      </div>

      <div>
        <Label htmlFor="gender">מגדר</Label>
        <Select id="gender" name="gender" defaultValue={initial?.gender || ""}>
          <option value="">לא צוין</option>
          <option value="male">זכר</option>
          <option value="female">נקבה</option>
          <option value="other">אחר</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="birth_date_gregorian">תאריך לידה (לועזי)</Label>
        <Input
          id="birth_date_gregorian"
          name="birth_date_gregorian"
          type="date"
          defaultValue={initial?.birth_date_gregorian || ""}
          onChange={(e) => setHebrewPreview(gregorianToHebrew(e.target.value) || "")}
        />
      </div>

      <div>
        <Label htmlFor="birth_date_hebrew">תאריך לידה (עברי)</Label>
        <Input
          id="birth_date_hebrew"
          name="birth_date_hebrew"
          defaultValue={initial?.birth_date_hebrew || ""}
          placeholder={hebrewPreview || "כ״ג בתמוז תשמ״ה"}
        />
        {hebrewPreview && !initial?.birth_date_hebrew && (
          <p className="mt-1 text-xs text-stone-500">חישוב אוטומטי: {hebrewPreview}</p>
        )}
      </div>

      <div>
        <Label htmlFor="residence">מקום מגורים</Label>
        <Input id="residence" name="residence" defaultValue={initial?.residence || ""} />
      </div>

      <div>
        <Label htmlFor="phone">טלפון</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          dir="ltr"
          className="text-left"
          placeholder="050-1234567"
          defaultValue={initial?.phone || ""}
        />
      </div>

      <div>
        <Label htmlFor="email">דוא"ל</Label>
        <Input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          className="text-left"
          placeholder="name@example.com"
          defaultValue={initial?.email || ""}
        />
      </div>

      <div>
        <Label htmlFor="family_position">מיקום במשפחה הגרעינית</Label>
        <Select
          id="family_position"
          name="family_position"
          defaultValue={initial?.family_position || ""}
        >
          <option value="">לא צוין</option>
          <option value="father">אב</option>
          <option value="mother">אם</option>
          <option value="child">ילד/ה</option>
          <option value="spouse">בן/בת זוג</option>
          <option value="eldest">בכור/ה</option>
          <option value="youngest">צעיר/ה</option>
        </Select>
      </div>

      {showParentSelect && (
        <div className="md:col-span-2">
          <Label htmlFor="parent_id">הורה בעץ *</Label>
          <Select id="parent_id" name="parent_id" defaultValue={initial?.parent_id || ""} required>
            <option value="">בחר הורה</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} (דור {p.generation})
              </option>
            ))}
          </Select>
        </div>
      )}

      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}

      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "שומר..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
