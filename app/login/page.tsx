import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-[#e8d5a3]">משפחת בלויא</h1>
          <p className="mt-1 text-sm text-stone-400">מאגר נתונים משפחתי</p>
          <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-l from-transparent via-[#c4a055] to-transparent" />
        </div>
        <Suspense fallback={<div className="text-center text-stone-400">טוען...</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-stone-500">
          הגדרה ראשונית?{" "}
          <Link href="/setup" className="text-[#c4a055] underline decoration-[#c4a055]/40 underline-offset-2 hover:text-[#e8d5a3]">
            הגדר סיסמה משפחתית
          </Link>
        </p>
      </div>
    </main>
  );
}
