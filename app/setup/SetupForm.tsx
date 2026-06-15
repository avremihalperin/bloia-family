"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { BrandLogoHero } from "@/components/layout/BrandLogo";

export function SetupForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [treeName, setTreeName] = useState("עץ המשפחה");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("setup_family_password", {
        new_password: password,
        new_tree_name: treeName,
        new_admin_pin: adminPin,
      });

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      router.push("/login");
    } catch {
      setError("שגיאה בהגדרה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <BrandLogoHero subtitle="הגדרה ראשונית — פעם אחת בלבד" />
        <Card className="w-full overflow-hidden border-[#c4a055]/25 shadow-2xl shadow-black/20">
          <div className="h-1 bg-gradient-to-l from-[#8b6914] via-[#c4a055] to-[#e8d5a3]" />
          <CardHeader>
            <CardTitle className="text-center font-display text-2xl">הגדרה ראשונית</CardTitle>
            <p className="text-center text-sm text-stone-500">
              הגדר סיסמה משפחתית, PIN מנהל ושם לעץ המשפחה
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="treeName">שם העץ</Label>
                <Input
                  id="treeName"
                  value={treeName}
                  onChange={(e) => setTreeName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">סיסמה משפחתית</Label>
                <p className="mb-1 text-xs text-stone-500">לכל המשפחה — לצפייה בעץ</p>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              <div>
                <Label htmlFor="adminPin">PIN מנהל</Label>
                <p className="mb-1 text-xs text-stone-500">רק לך — לניהול והזנת דור 1–2</p>
                <PasswordInput
                  id="adminPin"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  required
                  minLength={4}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "שומר..." : "הגדר מערכת"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm">
              <Link href="/login" className="text-[#c4a055] underline decoration-[#c4a055]/40 underline-offset-2">
                חזרה להתחברות
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
