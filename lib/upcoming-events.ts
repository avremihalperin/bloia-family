import type { Person } from "@/lib/types";
import { HebrewCalendar, HDate } from "@hebcal/core";

export type EventType = "birthday" | "yahrzeit" | "marriage" | "bar_mitzvah";

export interface UpcomingEvent {
  key: string;
  personId: string;
  personName: string;
  type: EventType;
  title: string;
  hebrewDate: string; // e.g. ט״ו חשון תשס״ט
  eventDate: string; // ISO YYYY-MM-DD (for sorting/daysUntil only)
  daysUntil: number;
  age: number | null;
  hebrewYear: number;
  hebrewMonth: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toStartOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseGregorianDateToDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function daysDiff(target: Date, from: Date): number {
  return Math.round((toStartOfDay(target).getTime() - toStartOfDay(from).getTime()) / DAY_MS);
}

function ageOnHebrewYear(person: Person, hyear: number): number | null {
  const birth = parseGregorianDateToDate(person.birth_date_gregorian);
  if (!birth) return null;
  const birthHd = new HDate(birth);
  return hyear - birthHd.getFullYear();
}

function nextHebrewBirthday(person: Person, fromHd: HDate): HDate | null {
  const birth = parseGregorianDateToDate(person.birth_date_gregorian);
  if (!birth) return null;

  const hyear = fromHd.getFullYear();
  const hdThisYear = HebrewCalendar.getBirthdayOrAnniversary(hyear, birth);
  if (!hdThisYear) return null;

  if (hdThisYear.abs() >= fromHd.abs()) return hdThisYear;
  const hdNextYear = HebrewCalendar.getBirthdayOrAnniversary(hyear + 1, birth);
  return hdNextYear ?? null;
}

function pushBirthday(events: UpcomingEvent[], person: Person, fromHd: HDate) {
  const nextHd = nextHebrewBirthday(person, fromHd);
  if (!nextHd) return;
  const nextGreg = nextHd.greg();
  const age = ageOnHebrewYear(person, nextHd.getFullYear());
  events.push({
    key: `birthday-${person.id}-${isoDate(nextGreg)}`,
    personId: person.id,
    personName: person.full_name,
    type: "birthday",
    title: "יום הולדת",
    hebrewDate: nextHd.renderGematriya(true),
    eventDate: isoDate(nextGreg),
    daysUntil: daysDiff(nextGreg, fromHd.greg()),
    age,
    hebrewYear: nextHd.getFullYear(),
    hebrewMonth: nextHd.getMonth(),
  });
}

function pushBarMitzvah(events: UpcomingEvent[], person: Person, fromHd: HDate) {
  if (person.gender !== "male") return;
  const birth = parseGregorianDateToDate(person.birth_date_gregorian);
  if (!birth) return;
  const birthHd = new HDate(birth);
  const hyear = birthHd.getFullYear() + 13;
  const hd = HebrewCalendar.getBirthdayOrAnniversary(hyear, birth);
  if (!hd) return;
  if (hd.abs() < fromHd.abs()) return;

  const greg = hd.greg();
  events.push({
    key: `bar-mitzvah-${person.id}-${isoDate(greg)}`,
    personId: person.id,
    personName: person.full_name,
    type: "bar_mitzvah",
    title: "בר מצוה",
    hebrewDate: hd.renderGematriya(true),
    eventDate: isoDate(greg),
    daysUntil: daysDiff(greg, fromHd.greg()),
    age: 13,
    hebrewYear: hd.getFullYear(),
    hebrewMonth: hd.getMonth(),
  });
}

function nextHebrewAnniversary(
  fromHd: HDate,
  original: Date,
  kind: "birthdayOrAnniversary" | "yahrzeit"
): HDate | null {
  const hyear = fromHd.getFullYear();
  const fn =
    kind === "yahrzeit"
      ? HebrewCalendar.getYahrzeit
      : HebrewCalendar.getBirthdayOrAnniversary;
  const hdThisYear = fn(hyear, original);
  if (!hdThisYear) return null;
  if (hdThisYear.abs() >= fromHd.abs()) return hdThisYear;
  const hdNextYear = fn(hyear + 1, original);
  return hdNextYear ?? null;
}

function pushOptionalAnnual(
  events: UpcomingEvent[],
  person: Person,
  fromHd: HDate,
  type: EventType,
  dateIso: string | null | undefined,
  titleBase: string,
  kind: "birthdayOrAnniversary" | "yahrzeit"
) {
  const original = parseGregorianDateToDate(dateIso);
  if (!original) return;
  const hd = nextHebrewAnniversary(fromHd, original, kind);
  if (!hd) return;
  const greg = hd.greg();
  const age = ageOnHebrewYear(person, hd.getFullYear());
  events.push({
    key: `${type}-${person.id}-${isoDate(greg)}`,
    personId: person.id,
    personName: person.full_name,
    type,
    title: titleBase,
    hebrewDate: hd.renderGematriya(true),
    eventDate: isoDate(greg),
    daysUntil: daysDiff(greg, fromHd.greg()),
    age,
    hebrewYear: hd.getFullYear(),
    hebrewMonth: hd.getMonth(),
  });
}

export function buildUpcomingEvents(people: Person[], fromDate = new Date()): UpcomingEvent[] {
  const events: UpcomingEvent[] = [];
  const start = toStartOfDay(fromDate);
  const fromHd = new HDate(start);

  for (const person of people) {
    pushBirthday(events, person, fromHd);
    pushBarMitzvah(events, person, fromHd);

    // Optional future fields, if they exist in DB later
    pushOptionalAnnual(
      events,
      person,
      fromHd,
      "marriage",
      (person as Person & { marriage_date_gregorian?: string | null }).marriage_date_gregorian,
      "נישואין",
      "birthdayOrAnniversary"
    );
    pushOptionalAnnual(
      events,
      person,
      fromHd,
      "yahrzeit",
      (person as Person & { death_date_gregorian?: string | null }).death_date_gregorian,
      "יארצייט",
      "yahrzeit"
    );
  }

  return events.sort(
    (a, b) =>
      a.daysUntil - b.daysUntil ||
      a.eventDate.localeCompare(b.eventDate) ||
      a.personName.localeCompare(b.personName, "he")
  );
}

export function eventTypeLabel(type: EventType): string {
  if (type === "birthday") return "ימי הולדת";
  if (type === "yahrzeit") return "יארצייט";
  if (type === "marriage") return "נישואין";
  return "בר מצוה";
}

export function formatEventLine(event: UpcomingEvent): string {
  const dayWord = event.daysUntil === 0 ? "היום" : `בעוד ${event.daysUntil} ימים`;
  const ageLabel = event.age !== null ? ` (${event.age})` : "";
  return `${event.title}${ageLabel} · ${event.hebrewDate} · ${dayWord}`;
}
