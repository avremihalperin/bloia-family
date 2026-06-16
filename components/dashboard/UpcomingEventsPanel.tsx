"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Person } from "@/lib/types";
import {
  buildUpcomingEvents,
  eventTypeLabel,
  formatEventLine,
  type EventType,
} from "@/lib/upcoming-events";
import { HDate } from "@hebcal/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UpcomingEventsPanelProps {
  people: Person[];
}

const EVENT_FILTERS: { id: EventType | "all"; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "birthday", label: "ימי הולדת" },
  { id: "yahrzeit", label: "יארצייט" },
  { id: "marriage", label: "נישואין" },
  { id: "bar_mitzvah", label: "בר מצוה" },
];

function hebrewMonthYearLabel(hyear: number, hmonth: number): string {
  const hd = new HDate(1, hmonth, hyear);
  const partsNoYear = hd.renderGematriya(true, true).split(" ");
  const month = partsNoYear.slice(1).join(" ");
  const year = hd.renderGematriya(true).split(" ").pop() || String(hyear);
  return `${month} ${year}`;
}

export function UpcomingEventsPanel({ people }: UpcomingEventsPanelProps) {
  const [filter, setFilter] = useState<EventType | "all">("all");

  const now = useMemo(() => new Date(), []);
  const nowHd = useMemo(() => new HDate(now), [now]);
  const [hebrewYear, setHebrewYear] = useState(() => nowHd.getFullYear());
  const [hebrewMonth, setHebrewMonth] = useState(() => nowHd.getMonth());

  const allEvents = useMemo(() => buildUpcomingEvents(people, now), [people, now]);

  const filtered = useMemo(() => {
    return allEvents.filter((ev) => {
      const okType = filter === "all" ? true : ev.type === filter;
      const okHebrewMonth = ev.hebrewYear === hebrewYear && ev.hebrewMonth === hebrewMonth;
      return okType && okHebrewMonth;
    });
  }, [allEvents, filter, hebrewYear, hebrewMonth]);

  const monthLabel = hebrewMonthYearLabel(hebrewYear, hebrewMonth);

  const prevMonth = () => {
    const first = new HDate(1, hebrewMonth, hebrewYear);
    const prev = new HDate(first.abs() - 1);
    setHebrewYear(prev.getFullYear());
    setHebrewMonth(prev.getMonth());
  };

  const nextMonth = () => {
    const first = new HDate(1, hebrewMonth, hebrewYear);
    const next = new HDate(first.abs() + first.daysInMonth());
    setHebrewYear(next.getFullYear());
    setHebrewMonth(next.getMonth());
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>אירועים קרובים</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={prevMonth}>
              חודש עברי קודם
            </Button>
            <span className="min-w-36 text-center text-sm text-stone-700">{monthLabel}</span>
            <Button size="sm" variant="outline" onClick={nextMonth}>
              חודש עברי הבא
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-stone-600">סנן לפי:</span>
          {EVENT_FILTERS.map((option) => (
            <Button
              key={option.id}
              size="sm"
              variant={filter === option.id ? "default" : "outline"}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-stone-500">
            אין אירועים בחודש זה עבור הסינון שנבחר.
            {filter === "yahrzeit" || filter === "marriage"
              ? " (יש להגדיר תאריכי פטירה/נישואין כדי שיופיעו אירועים מסוג זה)"
              : ""}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((event) => (
              <div
                key={event.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#c4a055]/15 bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[#1a1714]">
                    {eventTypeLabel(event.type)} · {event.personName}
                    {event.age !== null ? ` (${event.age})` : ""}
                  </p>
                  <p className="text-sm text-stone-600">{formatEventLine(event)}</p>
                </div>
                <Link
                  href={`/person/${event.personId}`}
                  className="text-sm font-medium text-[#8b6914] hover:underline"
                >
                  לפרופיל
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
