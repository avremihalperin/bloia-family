import Link from "next/link";
import { Suspense } from "react";
import { verifyAdminSession } from "@/lib/admin-session";
import { getBranches, getPeople } from "@/lib/data";
import { SearchBar } from "@/components/search/SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-6">
      {!isAdmin && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          רוצה להזין את העץ?{" "}
          <Link href="/admin/login" className="font-semibold underline">
            לחץ כאן לכניסת מנהל
          </Link>
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold text-amber-900">דשבורד</h2>
        <p className="text-stone-600">סקירה כללית של מאגר המשפחה</p>
      </div>

      <Suspense fallback={<div>טוען סינון...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">סה״כ אנשים</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-800">{people.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">משפחות (ענפים)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-800">{branches.length}</p>
          </CardContent>
        </Card>
        {Object.entries(byGeneration)
          .sort(([a], [b]) => Number(a) - Number(b))
          .slice(0, 2)
          .map(([gen, count]) => (
            <Card key={gen}>
              <CardHeader>
                <CardTitle className="text-base">דור {gen}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-800">{count}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>תצוגות מהירות</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/tree" className="rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">
            עץ משפחה
          </Link>
          <Link href="/table" className="rounded-lg border border-amber-300 px-4 py-2 hover:bg-amber-50">
            טבלה
          </Link>
          <Link href="/cards" className="rounded-lg border border-amber-300 px-4 py-2 hover:bg-amber-50">
            כרטיסים
          </Link>
          <Link href={isAdmin ? "/admin/seed" : "/admin/login"} className="rounded-lg border border-amber-300 px-4 py-2 hover:bg-amber-50">
            ניהול והזמנות
          </Link>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-lg font-semibold">אחרונים שנוספו</h3>
        <div className="space-y-2">
          {people
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8)
            .map((person) => (
              <Link
                key={person.id}
                href={`/person/${person.id}`}
                className="flex items-center justify-between rounded-lg border border-amber-100 bg-white px-4 py-3 hover:bg-amber-50"
              >
                <span className="font-medium">{person.full_name}</span>
                <Badge>דור {person.generation}</Badge>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
