import type { Gender, Person } from "@/lib/types";
import {
  formatDisplayName,
  formatSpouseLine,
  maritalStatusLabel,
  resolveHonorific,
  getSpouseName,
} from "@/lib/honorifics";

export { formatDisplayName, formatSpouseLine, maritalStatusLabel, resolveHonorific, getSpouseName };

export function genderLabel(gender: Gender | string | null | undefined) {
  if (gender === "male") return "זכר";
  if (gender === "female") return "נקבה";
  return null;
}

export function formatSpouseDisplayName(
  fullName: string,
  maidenName?: string | null
) {
  const trimmed = maidenName?.trim();
  return trimmed ? `${fullName} (${trimmed})` : fullName;
}

export function formatPersonHeading(
  person: Person,
  mode: "short" | "full" = "full"
) {
  return formatDisplayName(person, mode);
}

export function formatLinkedSpouseName(spouse: Person) {
  return formatSpouseDisplayName(spouse.full_name, spouse.maiden_name);
}

/** שם נעורים — לנשים נשואות שנכנסו למשפחה בנישואין, לא לבנות משפחה בעץ */
export function shouldShowMaidenName(
  person: Pick<Person, "gender" | "marital_status" | "parent_id"> & {
    /** טופס הוספת ילד/ה למשפחה — אין שם נעורים */
    isFamilyChildForm?: boolean;
  }
): boolean {
  if (person.isFamilyChildForm) return false;
  return (
    person.gender === "female" &&
    person.marital_status === "married" &&
    !person.parent_id
  );
}
