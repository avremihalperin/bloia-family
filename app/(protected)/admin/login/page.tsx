import { Suspense } from "react";
import { isAdminPinConfigured } from "@/lib/admin-session";
import { BrandLogoHero } from "@/components/layout/BrandLogo";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const pinConfigured = await isAdminPinConfigured();

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-8">
      <BrandLogoHero subtitle="כניסת מנהל" />
      <Suspense fallback={<div>טוען...</div>}>
        <AdminLoginForm pinConfigured={pinConfigured} />
      </Suspense>
    </main>
  );
}
