"use client";

import { useState } from "react";
import { resetFamilyPasswordViaAdmin } from "@/app/actions/family";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export function AdminFamilyPasswordClient() {
  const [password, setPassword] = useState("");
  const [treeName, setTreeName] = useState("עץ המשפחה");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await resetFamilyPasswordViaAdmin(password, treeName);
      setMessage("הסיסמה המשפחתית עודכנה. כל המשתמשים יצטרכו להתחבר מחדש.");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעדכון");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CollapsibleSection
      title="שינוי סיסמה משפחתית"
      subtitle="פעולה למנהל בלבד — דורש PIN מנהל פעיל"
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="newTreeName">שם העץ</Label>
          <Input
            id="newTreeName"
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="newFamilyPassword">סיסמה משפחתית חדשה</Label>
          <PasswordInput
            id="newFamilyPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />
        </div>
        {message && <p className="text-sm text-[#8b6914] md:col-span-2">{message}</p>}
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "שומר..." : "עדכן סיסמה משפחתית"}
          </Button>
        </div>
      </form>
    </CollapsibleSection>
  );
}
