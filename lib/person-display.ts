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
