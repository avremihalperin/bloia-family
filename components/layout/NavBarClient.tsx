"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "דשבורד" },
  { href: "/tree", label: "עץ משפחה" },
  { href: "/table", label: "טבלה" },
  { href: "/cards", label: "כרטיסים" },
];

interface NavBarClientProps {
  treeName: string;
  isAdmin: boolean;
  logoutAction: () => Promise<void>;
}

export function NavBarClient({ treeName, isAdmin, logoutAction }: NavBarClientProps) {
  const pathname = usePathname();
  const adminHref = isAdmin ? "/admin/seed" : "/admin/login";

  return (
    <header className="relative z-50 border-b border-amber-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <Link href="/" className="hover:opacity-80">
            <h1 className="text-xl font-bold text-amber-900">{treeName}</h1>
          </Link>
          <p className="text-sm text-stone-500">מאגר נתונים משפחתי</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className={`rounded-md border px-3 py-2 text-sm ${
                  active
                    ? "border-amber-400 bg-amber-100 font-medium text-amber-900"
                    : "border-transparent text-stone-700 hover:border-amber-200 hover:bg-amber-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={adminHref}
            prefetch
            className={`rounded-md border px-3 py-2 text-sm font-medium ${
              pathname.startsWith("/admin")
                ? "border-amber-600 bg-amber-700 text-white"
                : "border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200"
            }`}
          >
            ניהול
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              יציאה
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
