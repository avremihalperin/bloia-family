import type { Person } from "@/lib/types";

export function sortPeopleByBirthDate(people: Person[]): Person[] {
  return [...people].sort((a, b) => {
    const dateA = a.birth_date_gregorian || "9999-12-31";
    const dateB = b.birth_date_gregorian || "9999-12-31";
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const posA = Number(a.family_position) || 9999;
    const posB = Number(b.family_position) || 9999;
    if (posA !== posB) return posA - posB;

    return a.full_name.localeCompare(b.full_name, "he");
  });
}
