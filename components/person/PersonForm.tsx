"use client";

import { useMemo, useState } from "react";
import { gregorianToHebrew } from "@/lib/hebrew-date";
import { defaultHonorific, maritalStatusOptions } from "@/lib/honorifics";
import { shouldShowMaidenName } from "@/lib/person-display";
import { parentCoupleOptions } from "@/lib/parents";
import type { Gender, MaritalStatus, Person, PersonFormData } from "@/lib/types";
import { PhotoPicker } from "@/components/person/PhotoPicker";
import { SpouseLinker } from "@/components/person/SpouseLinker";
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
  /** מאפס את השדות אחרי שמירה מוצלחת (מתאים לטפסי הוספה) */
  resetOnSuccess?: boolean;
  /** לקישור בן/בת זוג — נדרשים כולם יחד */
  people?: Person[];
  onLinkSpouse?: (spouseId: string) => Promise<void>;
  onUnlinkSpouse?: () => Promise<void>;
  /** טופס ליצירת פרופיל בן/בת זוג חדש — ללא אזור קישור */
  creatingSpouse?: boolean;
}

export function PersonForm({
  initial,
  parents = [],
  onSubmit,
  submitLabel = "שמור",
  showParentSelect = false,
  showPhoto = true,
  resetOnSuccess = false,
  people,
  onLinkSpouse,
  onUnlinkSpouse,
  creatingSpouse = false,
}: PersonFormProps) {
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [gender, setGender] = useState<Gender>(initial?.gender ?? null);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | "">(
    initial?.marital_status ?? ""
  );
  const [birthGregorian, setBirthGregorian] = useState(initial?.birth_date_gregorian || "");
  const [isSoldier, setIsSoldier] = useState(initial?.is_soldier ?? false);
  const [hebrewPreview, setHebrewPreview] = useState(
    initial?.birth_date_hebrew ||
      gregorianToHebrew(initial?.birth_date_gregorian) ||
      ""
  );

  const honorificPlaceholder = useMemo(
    () =>
      defaultHonorific({
        gender,
        generation: initial?.generation ?? null,
        marital_status: maritalStatus || null,
        is_soldier: isSoldier,
        birth_date_gregorian: birthGregorian || null,
        honorific: null,
      }),
    [gender, initial?.generation, maritalStatus, isSoldier, birthGregorian]
  );

  const maritalOptions = maritalStatusOptions(gender);

  const parentOptions = useMemo(() => parentCoupleOptions(parents), [parents]);

  const showMaidenName = useMemo(
    () =>
      shouldShowMaidenName({
        gender,
        marital_status: maritalStatus || null,
        parent_id: initial?.parent_id ?? null,
        isFamilyChildForm: showParentSelect,
      }),
    [gender, maritalStatus, initial?.parent_id, showParentSelect]
  );

  const resetFormFields = () => {
    setGender(initial?.gender ?? null);
    setMaritalStatus(initial?.marital_status ?? "");
    setBirthGregorian(initial?.birth_date_gregorian || "");
    setIsSoldier(initial?.is_soldier ?? false);
    setHebrewPreview(
      initial?.birth_date_hebrew ||
        gregorianToHebrew(initial?.birth_date_gregorian) ||
        ""
    );
    setPhotoFile(null);
    setError(null);
    setFormKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const status = (form.get("marital_status") as MaritalStatus) || undefined;

    const data: PersonFormData = {
      full_name: String(form.get("full_name") || ""),
      nickname: String(form.get("nickname") || "") || undefined,
      birth_date_gregorian: String(form.get("birth_date_gregorian") || "") || undefined,
      birth_date_hebrew: String(form.get("birth_date_hebrew") || "") || undefined,
      residence: String(form.get("residence") || "") || undefined,
      phone: String(form.get("phone") || "") || undefined,
      email: String(form.get("email") || "") || undefined,
      maiden_name: showMaidenName
        ? String(form.get("maiden_name") || "") || undefined
        : undefined,
      family_position: String(form.get("family_position") || "") || undefined,
      gender: (form.get("gender") as Gender) || undefined,
      parent_id: String(form.get("parent_id") || "") || undefined,
      marital_status: status,
      honorific: String(form.get("honorific") || "") || undefined,
      is_soldier: form.get("is_soldier") === "on",
    };

    try {
      await onSubmit(data, photoFile);
      if (resetOnSuccess) resetFormFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div key={formKey}>
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
        <Select
          id="gender"
          name="gender"
          value={gender || ""}
          onChange={(e) => setGender((e.target.value as Gender) || null)}
        >
          <option value="">לא צוין</option>
          <option value="male">זכר</option>
          <option value="female">נקבה</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="marital_status">מצב משפחתי</Label>
        <Select
          id="marital_status"
          name="marital_status"
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus | "")}
        >
          <option value="">לא צוין</option>
          {maritalOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {maritalStatus === "married" && !creatingSpouse && (
        <div id="spouse" className="md:col-span-2">
          {initial?.id && people && onLinkSpouse && onUnlinkSpouse ? (
            <SpouseLinker
              person={initial as Person}
              people={people}
              onLink={onLinkSpouse}
              onUnlink={onUnlinkSpouse}
            />
          ) : (
            <p className="text-sm text-stone-600">
              לאחר שמירת הפרופיל ניתן יהיה לקשר או להוסיף בן/בת זוג מדף העריכה.
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="honorific">כינוי כבוד</Label>
        <Input
          id="honorific"
          name="honorific"
          defaultValue={initial?.honorific || ""}
          placeholder={honorificPlaceholder || "לפי ברירת מחדל"}
        />
        {honorificPlaceholder && !initial?.honorific && (
          <p className="mt-1 text-xs text-stone-500">
            ברירת מחדל: {honorificPlaceholder}
          </p>
        )}
      </div>

      <div className="flex items-end gap-2 pb-2">
        <input
          id="is_soldier"
          name="is_soldier"
          type="checkbox"
          checked={isSoldier}
          onChange={(e) => setIsSoldier(e.target.checked)}
          className="h-4 w-4 rounded border-stone-300"
        />
        <Label htmlFor="is_soldier" className="mb-0 cursor-pointer">
          {gender === "female" ? "חיילת בצ\"ה" : "חייל בצ\"ה"}
        </Label>
      </div>

      {showMaidenName && (
        <div>
          <Label htmlFor="maiden_name">שם נעורים</Label>
          <Input
            id="maiden_name"
            name="maiden_name"
            defaultValue={initial?.maiden_name || ""}
            placeholder="לתצוגה בקשרי נישואין"
          />
        </div>
      )}

      <div>
        <Label htmlFor="birth_date_gregorian">תאריך לידה (לועזי)</Label>
        <Input
          id="birth_date_gregorian"
          name="birth_date_gregorian"
          type="date"
          defaultValue={initial?.birth_date_gregorian || ""}
          onChange={(e) => {
            setBirthGregorian(e.target.value);
            setHebrewPreview(gregorianToHebrew(e.target.value) || "");
          }}
        />
      </div>

      <div>
        <Label htmlFor="birth_date_hebrew">תאריך לידה (עברי, אותיות)</Label>
        <Input
          id="birth_date_hebrew"
          name="birth_date_hebrew"
          defaultValue={initial?.birth_date_hebrew || ""}
          placeholder={hebrewPreview || "כ״ג תמוז תשמ״ה"}
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
        <Label htmlFor="family_position">מיקום בילדי המשפחה</Label>
        <Input
          id="family_position"
          name="family_position"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          placeholder="1, 2, 3..."
          defaultValue={initial?.family_position || ""}
        />
      </div>

      {showParentSelect && (
        <div className="md:col-span-2">
          <Label htmlFor="parent_id">זוג הורים בעץ *</Label>
          <Select id="parent_id" name="parent_id" defaultValue={initial?.parent_id || ""} required>
            <option value="">בחר זוג הורים</option>
            {parentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-stone-500">
            הילד/ה ישויך/תשויך לשני ההורים אם הם מקושרים כבני זוג
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}

      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "שומר..." : submitLabel}
        </Button>
      </div>
    </form>
    </div>
  );
}
