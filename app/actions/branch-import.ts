"use server";

import { revalidatePath } from "next/cache";
import { createPerson } from "@/app/actions/family";
import { getFamilyDbToken, verifyFamilySession } from "@/lib/family-session";
import { getAdminDbToken, verifyAdminSession } from "@/lib/admin-session";
import { parseBranchImportFile, type BranchImportRow } from "@/lib/branch-excel";
import { getBranches, getPeople } from "@/lib/data";
import type { Person } from "@/lib/types";

async function requireSession() {
  const familyToken = await getFamilyDbToken();
  if (familyToken && (await verifyFamilySession())) return true;
  const adminToken = await getAdminDbToken();
  if (adminToken && (await verifyAdminSession())) return true;
  throw new Error("נדרשת התחברות");
}

function findParentByName(
  name: string,
  branchPeople: Person[],
  rootPerson: Person
): Person | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  if (trimmed === rootPerson.full_name) return rootPerson;

  const matches = branchPeople.filter((p) => p.full_name === trimmed);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new Error(`שם הורה "${trimmed}" לא חד-משמעי — יש יותר מאדם אחד עם שם זה`);
  }
  return null;
}

function isDuplicate(
  row: BranchImportRow,
  parentId: string,
  branchPeople: Person[]
): boolean {
  return branchPeople.some(
    (p) => p.full_name === row.full_name.trim() && p.parent_id === parentId
  );
}

export async function importBranchDescendants(
  branchId: string,
  formData: FormData
): Promise<{ created: number; skipped: number; errors: string[] }> {
  await requireSession();

  const file = formData.get("file") as File | null;
  if (!file?.size) throw new Error("לא נבחר קובץ");

  const branches = await getBranches();
  const branch = branches.find((b) => b.id === branchId);
  if (!branch?.root_person_id) throw new Error("ענף לא נמצא");

  const allPeople = await getPeople();
  const branchPeople = allPeople.filter((p) => p.branch_id === branchId);
  const rootPerson = allPeople.find((p) => p.id === branch.root_person_id);
  if (!rootPerson) throw new Error("ענף (דור 2) לא נמצא");

  const buffer = await file.arrayBuffer();
  const rows = parseBranchImportFile(buffer);

  if (rows.length === 0) throw new Error("הקובץ ריק או ללא שורות תקינות");

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];
  const knownPeople = [...branchPeople, rootPerson];

  for (const [index, row] of rows.entries()) {
    const line = index + 2;
    try {
      if (!row.parent_name) {
        errors.push(`שורה ${line}: חסר שם הורה`);
        continue;
      }

      const parent = findParentByName(row.parent_name, knownPeople, rootPerson);
      if (!parent) {
        errors.push(`שורה ${line}: הורה "${row.parent_name}" לא נמצא בענף`);
        continue;
      }

      if (isDuplicate(row, parent.id, knownPeople)) {
        skipped++;
        continue;
      }

      const person = await createPerson({
        full_name: row.full_name,
        nickname: row.nickname,
        birth_date_gregorian: row.birth_date_gregorian,
        birth_date_hebrew: row.birth_date_hebrew,
        residence: row.residence,
        phone: row.phone,
        email: row.email,
        maiden_name: row.maiden_name,
        family_position: row.family_position,
        gender: row.gender,
        marital_status: row.marital_status,
        honorific: row.honorific,
        is_soldier: row.is_soldier,
        spouse_name: row.spouse_name,
        parent_id: parent.id,
      });

      knownPeople.push(person);
      created++;
    } catch (err) {
      errors.push(
        `שורה ${line}: ${err instanceof Error ? err.message : "שגיאה"}`
      );
    }
  }

  revalidatePath("/");
  revalidatePath("/table");
  revalidatePath("/tree");
  revalidatePath("/cards");

  return { created, skipped, errors };
}
