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
    <header className="sticky top-0 z-50 border-b border-[#c4a055]/15 bg-[#1a1714]/95 shadow-lg shadow-black/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div>
          <Link href="/" className="group block transition-opacity hover:opacity-90">
            <h1 className="font-display text-xl font-bold tracking-tight text-[#e8d5a3]">
              משפחת בלויא
            </h1>
            <p className="text-sm font-medium text-[#c4a055]/90">{treeName}</p>
          </Link>
          <p className="text-xs tracking-wide text-stone-400">מאגר נתונים משפחתי</p>
        </div>
        <nav className="flex flex-wrap items-center gap-1.5">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className={`rounded-lg px-3.5 py-2 text-sm transition-all duration-200 ${
                  active
                    ? "bg-[#c4a055]/20 font-medium text-[#e8d5a3]"
                    : "text-stone-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={adminHref}
            prefetch
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
              pathname.startsWith("/admin")
                ? "bg-gradient-to-l from-[#8b6914] to-[#c4a055] text-white shadow-md"
                : "border border-[#c4a055]/40 text-[#e8d5a3] hover:border-[#c4a055] hover:bg-[#c4a055]/10"
            }`}
          >
            ניהול
          </Link>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-stone-600 bg-transparent text-stone-300 hover:border-stone-400 hover:bg-white/5 hover:text-white"
            >
              יציאה
            </Button>
          </form>
        </nav>
      </div>
      <div className="h-px bg-gradient-to-l from-transparent via-[#c4a055]/50 to-transparent" />
    </header>
  );
}
