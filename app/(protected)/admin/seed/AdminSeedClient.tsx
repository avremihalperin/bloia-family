"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PersonForm } from "@/components/person/PersonForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Person, PersonFormData } from "@/lib/types";

interface AdminSeedClientProps {
  gen1People: Person[];
  gen2People: Person[];
  onCreateGen1: (data: PersonFormData, photoFile?: File | null) => Promise<unknown>;
  onCreateGen2: (data: PersonFormData, photoFile?: File | null) => Promise<unknown>;
  onLinkSpouses: (personId: string, spouseId: string) => Promise<void>;
}

export function AdminSeedClient({
  gen1People,
  gen2People,
  onCreateGen1,
  onCreateGen2,
  onLinkSpouses,
}: AdminSeedClientProps) {
  const router = useRouter();
  const [spouse1, setSpouse1] = useState("");
  const [spouse2, setSpouse2] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const linkSpousePair = async () => {
    if (!spouse1 || !spouse2) return;
    setError(null);
    try {
      await onLinkSpouses(spouse1, spouse2);
      setMessage("בני הזוג קושרו בהצלחה");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>דור 1 — סבא וסבתא</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            onSubmit={async (data, photoFile) => {
              setError(null);
              await onCreateGen1(data, photoFile);
              router.refresh();
            }}
            submitLabel="הוסף לדור 1"
          />
          {gen1People.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {gen1People.map((p) => (
                <li key={p.id} className="rounded-xl border border-[#c4a055]/15 bg-[#c4a055]/5 px-4 py-2.5">
                  {p.full_name} (דור {p.generation})
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>דור 2 — בנים ובנות</CardTitle>
          <p className="text-sm text-stone-500">בחר הורה מדור 1</p>
        </CardHeader>
        <CardContent>
          {gen1People.length === 0 ? (
            <p className="text-sm text-amber-800">הוסף קודם לפחות אדם אחד בדור 1</p>
          ) : (
            <PersonForm
              parents={gen1People}
              showParentSelect
              onSubmit={async (data, photoFile) => {
                setError(null);
                await onCreateGen2(data, photoFile);
                router.refresh();
              }}
              submitLabel="הוסף לדור 2"
            />
          )}
          {gen2People.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {gen2People.map((p) => (
                <li key={p.id} className="rounded-xl border border-[#c4a055]/15 bg-[#c4a055]/5 px-4 py-2.5">
                  {p.full_name} (דור {p.generation})
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>קישור בני זוג (דור 1)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>בן/בת זוג 1</Label>
              <Select value={spouse1} onChange={(e) => setSpouse1(e.target.value)}>
                <option value="">בחר</option>
                {gen1People.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>בן/בת זוג 2</Label>
              <Select value={spouse2} onChange={(e) => setSpouse2(e.target.value)}>
                <option value="">בחר</option>
                {gen1People.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </Select>
            </div>
          </div>
          <Button type="button" onClick={linkSpousePair}>קשר בני זוג</Button>
          {message && <p className="text-sm text-amber-800">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
