import type { Person } from "@/lib/types";

export function parentCoupleLabel(
  person: Person,
  peopleById: Map<string, Person>
): string {
  const spouse = person.spouse_id ? peopleById.get(person.spouse_id) : null;
  if (spouse) return `${person.full_name} ו${spouse.full_name}`;
  return person.full_name;
}

/** אפשרויות בחירת הורים — זוג מופיע פעם אחת */
export function parentCoupleOptions(people: Person[]): Array<{ value: string; label: string }> {
  const byId = new Map(people.map((p) => [p.id, p]));
  const seen = new Set<string>();
  const options: Array<{ value: string; label: string }> = [];

  for (const person of people) {
    if (seen.has(person.id)) continue;

    const spouse = person.spouse_id ? byId.get(person.spouse_id) : null;
    if (spouse) {
      seen.add(person.id);
      seen.add(spouse.id);
    }

    options.push({
      value: person.id,
      label: parentCoupleLabel(person, byId),
    });
  }

  return options;
}

export function resolveParentPair(
  parentId: string | null | undefined,
  peopleById: Map<string, Person>
): { parent_id: string | null; parent2_id: string | null } {
  if (!parentId) return { parent_id: null, parent2_id: null };
  const parent = peopleById.get(parentId);
  const spouseId = parent?.spouse_id ?? null;
  if (spouseId && spouseId !== parentId) {
    return { parent_id: parentId, parent2_id: spouseId };
  }
  return { parent_id: parentId, parent2_id: null };
}
