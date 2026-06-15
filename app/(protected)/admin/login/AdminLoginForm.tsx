"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm({ pinConfigured }: { pinConfigured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [mode, setMode] = useState<"login" | "setup">(pinConfigured ? "login" : "setup");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(pinConfigured ? "login" : "setup");
  }, [pinConfigured]);

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      setError("ה-PIN לא תואם");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("set_admin_pin", { input_pin: pin });
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      setMode("login");
      setError(null);
    } catch {
      setError("שגיאה בהגדרת PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "שגיאה");
        return;
      }

      const redirect = searchParams.get("redirect") || "/admin/seed";
      router.push(redirect);
      router.refresh();
    } catch {
      setError("שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "setup") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">הגדרת PIN מנהל</CardTitle>
          <p className="text-center text-sm text-stone-500">
            PIN נפרד מהסיסמה המשפחתית — רק אתה תשתמש בו לניהול העץ
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetupPin} className="space-y-4">
            <div>
              <Label htmlFor="pin">PIN מנהל</Label>
              <PasswordInput id="pin" value={pin} onChange={(e) => setPin(e.target.value)} required minLength={4} />
            </div>
            <div>
              <Label htmlFor="confirmPin">אימות PIN</Label>
              <PasswordInput
                id="confirmPin"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                required
                minLength={4}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "שומר..." : "שמור PIN מנהל"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">כניסת מנהל</CardTitle>
        <p className="text-center text-sm text-stone-500">הזן PIN מנהל כדי לגשת לניהול העץ</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="pin">PIN מנהל</Label>
            <PasswordInput id="pin" value={pin} onChange={(e) => setPin(e.target.value)} required autoFocus />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "מתחבר..." : "כניסה לניהול"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
