import type { Gender, MaritalStatus, Person } from "@/lib/types";

const BAR_MITZVAH_AGE = 13;
/** גרש עברי — מוצג נכון ב-BiDi (בניגוד לגרש ASCII) */
const GERESH = "\u05F3";

export function maritalStatusOptions(gender: Gender | null | undefined) {
  const female = gender === "female";
  return [
    { value: "single" as const, label: female ? "רווקה" : "רווק" },
    { value: "married" as const, label: female ? "נשואה" : "נשוי" },
    { value: "divorced" as const, label: female ? "גרושה" : "גרוש" },
    { value: "widowed" as const, label: female ? "אלמנה" : "אלמן" },
  ];
}

export function maritalStatusLabel(
  status: MaritalStatus | string | null | undefined,
  gender: Gender | null | undefined
): string | null {
  if (!status) return null;
  return maritalStatusOptions(gender).find((o) => o.value === status)?.label ?? null;
}

export function getAge(birthDateGregorian: string | null | undefined): number | null {
  if (!birthDateGregorian) return null;
  const born = new Date(birthDateGregorian);
  if (Number.isNaN(born.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age--;
  }
  return age;
}

type HonorificInput = Pick<
  Person,
  | "gender"
  | "generation"
  | "marital_status"
  | "is_soldier"
  | "birth_date_gregorian"
  | "honorific"
>;

export function defaultHonorific(person: HonorificInput): string | null {
  if (person.is_soldier ?? false) {
    return person.gender === "female" ? 'החיילת בצ"ה' : 'החייל בצ"ה';
  }

  if (person.marital_status === "married") {
    if (person.gender === "female") return "מרת";
    if (person.gender === "male") {
      if (person.generation && person.generation <= 2) return 'הרה"ח';
      return "ר'";
    }
  }

  if (
    person.gender === "male" &&
    person.marital_status === "single"
  ) {
    const age = getAge(person.birth_date_gregorian);
    if (age !== null && age >= BAR_MITZVAH_AGE) return `הת${GERESH}`;
  }

  return null;
}

export function resolveHonorific(person: HonorificInput): string | null {
  const custom = person.honorific?.trim();
  if (custom) return custom;
  return defaultHonorific(person);
}

/**
 * אחרית שם — שי׳ לבנים, שתחי׳ לבנות
 * מוצג רק כשהאדם לא נשוי (לנשואים יש כינוי כבוד שמחליף)
 * ורק כשיש מגדר מוגדר.
 */
export function nameSuffix(
  person: Pick<Person, "gender">
): string | null {
  if (person.gender === "male") return `שי${GERESH}`;
  if (person.gender === "female") return `שתחי${GERESH}`;
  return null;
}

export function formatDisplayName(
  person: Pick<Person, "full_name" | "honorific" | "gender" | "generation" | "marital_status" | "is_soldier" | "birth_date_gregorian">,
  mode: "short" | "full" = "full"
): string {
  if (mode !== "full") return person.full_name;
  const honorific = resolveHonorific(person);
  const suffix = nameSuffix(person);
  const withHonorific = honorific ? `${honorific} ${person.full_name}` : person.full_name;
  return suffix ? `${withHonorific} ${suffix}` : withHonorific;
}

export function getSpouseName(
  person: Pick<Person, "spouse_name">,
  linkedSpouse?: Pick<Person, "full_name" | "maiden_name"> | null
): string | null {
  if (linkedSpouse) {
    return linkedSpouse.maiden_name
      ? `${linkedSpouse.full_name} (${linkedSpouse.maiden_name})`
      : linkedSpouse.full_name;
  }
  if (person.spouse_name?.trim()) return person.spouse_name.trim();
  return null;
}

export function formatSpouseLine(
  person: Pick<Person, "gender" | "marital_status" | "spouse_name">,
  linkedSpouse?: Pick<Person, "full_name" | "maiden_name"> | null
): string | null {
  if (person.marital_status !== "married") return null;
  const female = person.gender === "female";
  const prefix = female ? "נשואה ל" : "נשוי ל";
  const name = getSpouseName(person, linkedSpouse);
  return name ? `${prefix}${name}` : null;
}
