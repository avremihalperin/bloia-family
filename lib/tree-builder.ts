import type { Person, TreeNode } from "@/lib/types";
import { getBirthYear } from "@/lib/hebrew-date";

export function buildTree(people: Person[]): TreeNode[] {
  const byId = new Map<string, Person>();
  const childrenMap = new Map<string, Person[]>();

  for (const person of people) {
    byId.set(person.id, person);
    if (person.parent_id) {
      const siblings = childrenMap.get(person.parent_id) ?? [];
      siblings.push(person);
      childrenMap.set(person.parent_id, siblings);
    }
  }

  const toNode = (person: Person): TreeNode => {
    const children = (childrenMap.get(person.id) ?? [])
      .filter((child) => child.spouse_id !== person.id)
      .sort((a, b) => a.full_name.localeCompare(b.full_name, "he"))
      .map(toNode);

    let spouse: TreeNode | undefined;
    if (person.spouse_id) {
      const spousePerson = byId.get(person.spouse_id);
      if (spousePerson) {
        spouse = {
          id: spousePerson.id,
          name: spousePerson.full_name,
          nickname: spousePerson.nickname,
          generation: spousePerson.generation,
          photo_url: spousePerson.photo_url,
          birthYear: getBirthYear(
            spousePerson.birth_date_gregorian,
            spousePerson.birth_date_hebrew
          ),
          gender: spousePerson.gender,
          children: [],
        };
      }
    }

    return {
      id: person.id,
      name: person.full_name,
      nickname: person.nickname,
      generation: person.generation,
      photo_url: person.photo_url,
      birthYear: getBirthYear(person.birth_date_gregorian, person.birth_date_hebrew),
      gender: person.gender,
      children,
      spouse,
    };
  };

  const roots = people
    .filter((p) => !p.parent_id)
    .sort((a, b) => (a.generation ?? 0) - (b.generation ?? 0) || a.full_name.localeCompare(b.full_name, "he"));

  return roots.map(toNode);
}

export function filterTreeByBranch(people: Person[], branchId: string | null): Person[] {
  if (!branchId) return people;
  const branchPeople = people.filter((p) => p.branch_id === branchId);
  const ids = new Set(branchPeople.map((p) => p.id));

  // Include ancestors up to roots
  let changed = true;
  while (changed) {
    changed = false;
    for (const person of people) {
      if (ids.has(person.id) && person.parent_id && !ids.has(person.parent_id)) {
        ids.add(person.parent_id);
        changed = true;
      }
    }
  }

  return people.filter((p) => ids.has(p.id));
}
