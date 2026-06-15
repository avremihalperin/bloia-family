"use client";

import { useState } from "react";
import { createInvitation } from "@/app/actions/family";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Person } from "@/lib/types";

interface AdminInvitesClientProps {
  people: Person[];
  baseUrl: string;
}

export function AdminInvitesClient({ people, baseUrl }: AdminInvitesClientProps) {
  const [parentId, setParentId] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eligible = people.filter((p) => (p.generation ?? 0) >= 2);

  const generateInvite = async () => {
    if (!parentId) return;
    setLoading(true);
    setError(null);
    try {
      const invitation = await createInvitation(parentId);
      setInviteUrl(`${baseUrl}/join/${invitation.token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (inviteUrl) await navigator.clipboard.writeText(inviteUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>יצירת קישור הזמנה</CardTitle>
        <p className="text-sm text-stone-500">
          שלח קישור לנכד/נין כדי שיוכל להצטרף ולהזין את פרטיו
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>הורה בעץ (נקודת חיבור)</Label>
          <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">בחר הורה</option>
            {eligible.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} (דור {p.generation})
              </option>
            ))}
          </Select>
        </div>

        <Button onClick={generateInvite} disabled={loading || !parentId}>
          {loading ? "יוצר..." : "צור קישור הזמנה"}
        </Button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {inviteUrl && (
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="mb-2 text-sm font-medium">קישור ההזמנה:</p>
            <code className="block break-all text-sm">{inviteUrl}</code>
            <Button className="mt-3" size="sm" variant="outline" onClick={copyLink}>
              העתק קישור
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
