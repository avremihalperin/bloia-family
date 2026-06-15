"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registerViaInvitation } from "@/app/actions/family";
import { createClient } from "@/lib/supabase/client";
import { PersonForm } from "@/components/person/PersonForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Invitation, Person } from "@/lib/types";
import { BrandLogoHero } from "@/components/layout/BrandLogo";

interface JoinClientProps {
  token: string;
  invitation: Invitation | null;
  parents: Person[];
}

export function JoinClient({ token, invitation, parents }: JoinClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "form">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setStep("form");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setStep("form");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!invitation) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="p-8 text-center text-red-600">
          קישור ההזמנה לא תקין או שפג תוקפו
        </CardContent>
      </Card>
    );
  }

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/join/${token}`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setError(null);
    alert("נשלח קישור התחברות לאימייל שלך. לחץ עליו כדי להמשיך.");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BrandLogoHero subtitle="הצטרפות לעץ המשפחה" />

      {step === "email" && (
        <Card>
          <CardHeader>
            <CardTitle>אימות אימייל</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendMagicLink} className="space-y-4">
              <div>
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "שולח..." : "שלח קישור התחברות"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === "form" && userId && (
        <Card>
          <CardHeader>
            <CardTitle>פרטים אישיים</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonForm
              initial={{ parent_id: invitation.parent_person_id || undefined }}
              parents={parents}
              showParentSelect
              onSubmit={async (data, photoFile) => {
                const person = await registerViaInvitation(token, data, photoFile);
                router.push(`/person/${person.id}`);
              }}
              submitLabel="הצטרף לעץ"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
