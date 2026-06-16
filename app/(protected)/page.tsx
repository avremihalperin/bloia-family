import Link from "next/link";
import { Suspense } from "react";
import { verifyAdminSession } from "@/lib/admin-session";
import { getBranches, getPeople } from "@/lib/data";
import { SearchBar } from "@/components/search/SearchBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { UpcomingEventsPanel } from "@/components/dashboard/UpcomingEventsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditPersonButton } from "@/components/person/EditPersonButton";
import { genderLinkClasses, genderRowClasses } from "@/lib/gender-colors";
import { formatDisplayName } from "@/lib/person-display";
import { cn } from "@/lib/utils";

const statTones = [
  { bg: "!bg-[#faf7f2]", border: "border-[#c4a055]/30", accent: "border-t-[#8b6914]" },
  { bg: "!bg-[#f5efe3]", border: "border-[#c4a055]/28", accent: "border-t-[#94701c]" },
  { bg: "!bg-[#f0e8d8]", border: "border-[#c4a055]/26", accent: "border-t-[#9f7822]" },
  { bg: "!bg-[#ebe3d0]", border: "border-[#c4a055]/24", accent: "border-t-[#aa8228]" },
  { bg: "!bg-[#e8dcc4]", border: "border-[#c4a055]/22", accent: "border-t-[#b58c2e]" },
  { bg: "!bg-[#e5d5b8]", border: "border-[#c4a055]/20", accent: "border-t-[#c4a055]" },
  { bg: "!bg-[#f2ead8]", border: "border-[#c4a055]/18", accent: "border-t-[#cdb46a]" },
  { bg: "!bg-[#efe6d4]", border: "border-[#c4a055]/16", accent: "border-t-[#d6be7c]" },
] as const;

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
  const allPeople = await getPeople();
  const people = await getPeople({
    branchId: params.branch || null,
    generation: params.gen ? Number(params.gen) : null,
    query: params.q || null,
  });

  const byGeneration = allPeople.reduce<Record<number, number>>((acc, p) => {
    const gen = p.generation ?? 0;
    if (gen <= 0) return acc;
    acc[gen] = (acc[gen] || 0) + 1;
    return acc;
  }, {});

  const generationEntries = [1, 2, 3, 4, 5, 6].map((gen) => ({
    gen,
    count: byGeneration[gen] || 0,
  }));

  const statCards = [
    { label: "סה״כ אנשים", value: allPeople.length },
    { label: "משפחות", value: branches.length },
    ...generationEntries.map(({ gen, count }) => ({
      label: `דור ${gen}`,
      value: count,
    })),
  ];

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

      <div className="overflow-x-auto pb-1">
        <div className="grid w-full min-w-[64rem] grid-cols-8 gap-3">
          {statCards.map((card, index) => {
            const tone = statTones[index];
            return (
              <Card
                key={card.label}
                className={cn(
                  "overflow-hidden rounded-2xl border border-t-[3px] shadow-sm transition-shadow hover:shadow-md",
                  tone.bg,
                  tone.border,
                  tone.accent
                )}
              >
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-sm font-medium text-stone-600">
                    {card.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="font-display text-3xl font-bold text-[#8b6914]">{card.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Suspense fallback={<div className="text-muted text-sm">טוען סינון...</div>}>
        <SearchBar branches={branches} />
      </Suspense>

      <UpcomingEventsPanel people={people} />

      <div>
        <h3 className="font-display mb-4 text-lg font-semibold text-[#1a1714]">אחרונים שנוספו</h3>
        <div className="space-y-2">
          {people
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 8)
            .map((person) => (
              <div
                key={person.id}
                className={genderRowClasses(person.gender, "flex items-center justify-between gap-3 px-5 py-3.5 duration-200")}
              >
                <Link href={`/person/${person.id}`} className={genderLinkClasses(person.gender)}>
                  {formatDisplayName(person, "short")}
                </Link>
                <div className="flex items-center gap-2">
                  <Badge>דור {person.generation}</Badge>
                  <EditPersonButton personId={person.id} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
