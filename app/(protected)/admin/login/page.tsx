import { Suspense } from "react";
import { isAdminPinConfigured } from "@/lib/admin-session";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const pinConfigured = await isAdminPinConfigured();

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <Suspense fallback={<div>טוען...</div>}>
        <AdminLoginForm pinConfigured={pinConfigured} />
      </Suspense>
    </main>
  );
}
