import Link from "next/link";
import { Suspense } from "react";
import { isPasswordConfigured } from "@/lib/data";
import { BrandLogoHero } from "@/components/layout/BrandLogo";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const configured = await isPasswordConfigured();

  return (
    <main className="auth-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <BrandLogoHero subtitle="מאגר נתונים משפחתי" />
        <Suspense fallback={<div className="text-center text-stone-400">טוען...</div>}>
          <LoginForm />
        </Suspense>
        {!configured ? (
          <p className="text-center text-sm text-stone-500">
            הגדרה ראשונית?{" "}
            <Link href="/setup" className="text-[#c4a055] underline decoration-[#c4a055]/40 underline-offset-2 hover:text-[#e8d5a3]">
              הגדר סיסמה משפחתית
            </Link>
          </p>
        ) : (
          <p className="text-center text-sm text-stone-500">
            מנהל?{" "}
            <Link href="/admin/login" className="text-[#c4a055] underline decoration-[#c4a055]/40 underline-offset-2 hover:text-[#e8d5a3]">
              כניסה לניהול
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
