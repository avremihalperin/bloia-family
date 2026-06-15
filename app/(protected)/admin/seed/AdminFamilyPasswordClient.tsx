"use client";

import { useState } from "react";
import { resetFamilyPasswordViaAdmin } from "@/app/actions/family";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>שינוי סיסמה משפחתית</CardTitle>
        <p className="text-sm text-stone-500">
          פעולה למנהל בלבד — דורש PIN מנהל פעיל
        </p>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
