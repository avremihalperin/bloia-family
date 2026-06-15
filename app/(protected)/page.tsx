import Link from "next/link";
import { Suspense } from "react";
import { verifyAdminSession } from "@/lib/admin-session";
import { getBranches, getPeople } from "@/lib/data";
import { SearchBar } from "@/components/search/SearchBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{
    branch?: string;
    gen?: string;
    q?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isAdmin = await verifyAdminSession();
  const branches = await getBranches();
  const people = await getPeople({
    branchId: params.branch || null,
    generation: params.gen ? Number(params.gen) : null,
    query: params.q || null,
  });

  const byGeneration = people.reduce<Record<number, number>>((acc, p) => {
    const gen = p.generation ?? 0;
    acc[gen] = (acc[gen] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {!isAdmin && (
        <div className="rounded-2xl border border-[#c4a055]/30 bg-gradient-to-l from-[#c4a055]/10 to-transparent px-5 py-4 text-sm text-[#1a1714]">
          רוצה להזין את העץ?{" "}
          <Link href="/admin/login" className="font-semibold text-[#8b6914] underline decoration-[#c4a055]/50 underline-offset-2">
            לחץ כאן לכניסת מנהל
          </Link>
        </div>
      )}

      <PageHeader title="דשבורד" subtitle="סקירה כללית של מאגר המשפחה" />

      <Suspense fallback={<div className="text-muted text-sm">טוען סינון...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-base font-medium text-stone-500">סה״כ אנשים</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-bold text-[#8b6914]">{people.length}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-base font-medium text-stone-500">משפחות (ענפים)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-bold text-[#8b6914]">{branches.length}</p>
          </CardContent>
        </Card>
        {Object.entries(byGeneration)
          .sort(([a], [b]) => Number(a) - Number(b))
          .slice(0, 2)
          .map(([gen, count]) => (
            <Card key={gen} className="stat-card">
              <CardHeader>
                <CardTitle className="text-base font-medium text-stone-500">דור {gen}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-4xl font-bold text-[#8b6914]">{count}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>תצוגות מהירות</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/tree">
            <Button>עץ משפחה</Button>
          </Link>
          <Link href="/table">
            <Button variant="outline">טבלה</Button>
          </Link>
          <Link href="/cards">
            <Button variant="outline">כרטיסים</Button>
          </Link>
          <Link href={isAdmin ? "/admin/seed" : "/admin/login"}>
            <Button variant="outline">ניהול והזמנות</Button>
          </Link>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-display mb-4 text-lg font-semibold text-[#1a1714]">אחרונים שנוספו</h3>
        <div className="space-y-2">
          {people
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8)
            .map((person) => (
              <Link
                key={person.id}
                href={`/person/${person.id}`}
                className="flex items-center justify-between rounded-xl border border-[#c4a055]/15 bg-white/60 px-5 py-3.5 transition-all duration-200 hover:border-[#c4a055]/35 hover:bg-white hover:shadow-md"
              >
                <span className="font-medium text-[#1a1714]">{person.full_name}</span>
                <Badge>דור {person.generation}</Badge>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
