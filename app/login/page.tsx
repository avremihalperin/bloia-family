import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-white p-4">
      <div className="w-full max-w-md space-y-4">
        <Suspense fallback={<div className="text-center">טוען...</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-stone-500">
          הגדרה ראשונית?{" "}
          <Link href="/setup" className="text-amber-800 underline">
            הגדר סיסמה משפחתית
          </Link>
        </p>
      </div>
    </main>
  );
}
