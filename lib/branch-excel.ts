import * as XLSX from "xlsx";
import type { Gender, MaritalStatus, Person } from "@/lib/types";

export const BRANCH_IMPORT_HEADERS = [
  "שם הורה",
  "שם מלא",
  "כינוי",
  "מגדר",
  "תאריך לידה (לועזי)",
  "תאריך לידה (עברי)",
  "שם נעורים",
  "מצב משפחתי",
  "שם בן/בת זוג",
  "כינוי כבוד",
  'חייל/ת בצ"ה',
  "מגורים",
  "טלפון",
  'דוא"ל',
  "מיקום בילדים",
] as const;

export type BranchImportRow = {
  parent_name: string;
  full_name: string;
  nickname?: string;
  gender?: Gender;
  birth_date_gregorian?: string;
  birth_date_hebrew?: string;
  maiden_name?: string;
  marital_status?: MaritalStatus;
  spouse_name?: string;
  honorific?: string;
  is_soldier?: boolean;
  residence?: string;
  phone?: string;
  email?: string;
  family_position?: string;
};

function cell(row: Record<string, unknown>, header: string): string {
  const value = row[header];
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function parseGender(value: string): Gender | undefined {
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  if (v === "זכר" || v === "male" || v === "m") return "male";
  if (v === "נקבה" || v === "female" || v === "f") return "female";
  return undefined;
}

export function parseMaritalStatus(value: string): MaritalStatus | undefined {
  const v = value.trim();
  if (!v) return undefined;
  if (["רווק", "רווקה", "single"].includes(v)) return "single";
  if (["נשוי", "נשואה", "married"].includes(v)) return "married";
  if (["גרוש", "גרושה", "divorced"].includes(v)) return "divorced";
  if (["אלמן", "אלמנה", "widowed"].includes(v)) return "widowed";
  return undefined;
}

export function parseBooleanHebrew(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === "כן" || v === "yes" || v === "true" || v === "1";
}

function normalizeDate(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export function personToImportRow(person: Person, parentName: string): string[] {
  const genderLabel =
    person.gender === "male" ? "זכר" : person.gender === "female" ? "נקבה" : "";
  const maritalLabels: Record<MaritalStatus, string> = {
    single: person.gender === "female" ? "רווקה" : "רווק",
    married: person.gender === "female" ? "נשואה" : "נשוי",
    divorced: person.gender === "female" ? "גרושה" : "גרוש",
    widowed: person.gender === "female" ? "אלמנה" : "אלמן",
  };
  const marital =
    person.marital_status && maritalLabels[person.marital_status as MaritalStatus]
      ? maritalLabels[person.marital_status as MaritalStatus]
      : "";

  return [
    parentName,
    person.full_name,
    person.nickname || "",
    genderLabel,
    person.birth_date_gregorian || "",
    person.birth_date_hebrew || "",
    person.maiden_name || "",
    marital,
    person.spouse_name || "",
    person.honorific || "",
    person.is_soldier ? "כן" : "לא",
    person.residence || "",
    person.phone || "",
    person.email || "",
    person.family_position || "",
  ];
}

export function buildBranchTemplateWorkbook(
  branchLabel: string,
  rootPerson: Person,
  descendants: Person[]
) {
  const wb = XLSX.utils.book_new();

  const instructions = [
    ["הוראות למילוי טבלת צאצאי הענף"],
    [""],
    [`משפחה: ${branchLabel}`],
    [`ענף (דור 2): ${rootPerson.full_name}`],
    [""],
    ["• שם הורה — חייב להתאים לשם מלא של אדם קיים במשפחה (הענף או צאצא קודם)."],
    ["• שם מלא — שדה חובה לכל שורה חדשה."],
    ["• מגדר: זכר / נקבה"],
    ["• מצב משפחתי: רווק/רווקה, נשוי/נשואה, גרוש/גרושה, אלמן/אלמנה"],
    ['• חייל/ת בצ"ה: כן / לא'],
    ["• תאריך לידה לועזי: YYYY-MM-DD"],
    [""],
    ["מיון בעץ:"],
    ["  דור 2 = ענף | דור 3 = חוטר | דור 4 = נצר"],
    [""],
    ["מלאו את גיליון 'צאצאים' והעלו דרך האתר."],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(instructions), "הוראות");

  const byId = new Map(descendants.map((p) => [p.id, p]));
  const dataRows: string[][] = [Array.from(BRANCH_IMPORT_HEADERS)];

  const sorted = [...descendants]
    .filter((p) => (p.generation ?? 0) > 2)
    .sort((a, b) => (a.generation ?? 0) - (b.generation ?? 0) || a.full_name.localeCompare(b.full_name, "he"));

  for (const person of sorted) {
    const parent = person.parent_id ? byId.get(person.parent_id) : rootPerson;
    const parentName = parent?.full_name || rootPerson.full_name;
    dataRows.push(personToImportRow(person, parentName));
  }

  if (dataRows.length === 1) {
    dataRows.push([
      rootPerson.full_name,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "לא",
      "",
      "",
      "",
      "",
    ]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(dataRows);
  sheet["!cols"] = BRANCH_IMPORT_HEADERS.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, sheet, "צאצאים");

  return wb;
}

export function downloadBranchTemplate(
  branchLabel: string,
  rootPerson: Person,
  descendants: Person[]
) {
  const wb = buildBranchTemplateWorkbook(branchLabel, rootPerson, descendants);
  const safeName = branchLabel.replace(/[^\w\u0590-\u05FF\s-]/g, "").trim() || "ענף";
  XLSX.writeFile(wb, `תבנית-צאצאים-${safeName}.xlsx`);
}

export function parseBranchImportFile(buffer: ArrayBuffer): BranchImportRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName =
    wb.SheetNames.find((n) => n === "צאצאים") ?? wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const rows: BranchImportRow[] = [];

  for (const row of raw) {
    const parent_name = cell(row, "שם הורה");
    const full_name = cell(row, "שם מלא");
    if (!full_name) continue;

    rows.push({
      parent_name,
      full_name,
      nickname: cell(row, "כינוי") || undefined,
      gender: parseGender(cell(row, "מגדר")),
      birth_date_gregorian: normalizeDate(cell(row, "תאריך לידה (לועזי)")),
      birth_date_hebrew: cell(row, "תאריך לידה (עברי)") || undefined,
      maiden_name: cell(row, "שם נעורים") || undefined,
      marital_status: parseMaritalStatus(cell(row, "מצב משפחתי")),
      spouse_name: cell(row, "שם בן/בת זוג") || undefined,
      honorific: cell(row, "כינוי כבוד") || undefined,
      is_soldier: parseBooleanHebrew(cell(row, 'חייל/ת בצ"ה')),
      residence: cell(row, "מגורים") || undefined,
      phone: cell(row, "טלפון") || undefined,
      email: cell(row, 'דוא"ל') || undefined,
      family_position: cell(row, "מיקום בילדים") || undefined,
    });
  }

  return rows;
}
