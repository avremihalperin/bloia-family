import { HDate } from "@hebcal/core";

export function gregorianToHebrew(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const hdate = new HDate(new Date(year, month - 1, day));
    return hdate.render("he");
  } catch {
    return null;
  }
}

export function displayBirthDates(
  gregorian: string | null | undefined,
  hebrewOverride: string | null | undefined
): { gregorian: string | null; hebrew: string | null } {
  const computedHebrew = gregorianToHebrew(gregorian);
  return {
    gregorian: gregorian
      ? new Date(gregorian).toLocaleDateString("he-IL")
      : null,
    hebrew: hebrewOverride || computedHebrew,
  };
}

export function getBirthYear(
  gregorian: string | null | undefined,
  hebrew: string | null | undefined
): string | null {
  if (gregorian) {
    return String(new Date(gregorian).getFullYear());
  }
  if (hebrew) {
    const match = hebrew.match(/תש[\u05d0-\u05ea״"]+/);
    return match ? match[0] : null;
  }
  return null;
}
