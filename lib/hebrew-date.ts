import { HDate } from "@hebcal/core";

/** תאריך עברי באותיות גימטריה בלבד (ללא ספרות לועזיות) */
export function gregorianToHebrew(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const hdate = new HDate(new Date(year, month - 1, day));
    return hdate.renderGematriya(true);
  } catch {
    return null;
  }
}

/** מסיר ספרות לועזיות מתאריך עברי ידני אם הוזן בטעות */
export function normalizeHebrewDate(hebrew: string | null | undefined): string | null {
  if (!hebrew?.trim()) return null;
  const cleaned = hebrew.replace(/[0-9]/g, "").replace(/\s+/g, " ").trim();
  return cleaned || null;
}

export function displayBirthDates(
  gregorian: string | null | undefined,
  hebrewOverride: string | null | undefined
): { gregorian: string | null; hebrew: string | null } {
  const computedHebrew = gregorianToHebrew(gregorian);
  const manualHebrew = normalizeHebrewDate(hebrewOverride);

  return {
    gregorian: gregorian
      ? new Date(gregorian).toLocaleDateString("he-IL")
      : null,
    hebrew: manualHebrew || computedHebrew,
  };
}

export function getBirthYear(
  gregorian: string | null | undefined,
  hebrew: string | null | undefined
): string | null {
  if (gregorian) {
    try {
      const [year, month, day] = gregorian.split("-").map(Number);
      const hdate = new HDate(new Date(year, month - 1, day));
      const parts = hdate.renderGematriya(true).split(" ");
      return parts[parts.length - 1] || null;
    } catch {
      return null;
    }
  }
  if (hebrew) {
    const match = hebrew.match(/תש[\u05d0-\u05ea״"']+/);
    return match ? match[0] : null;
  }
  return null;
}
