import type { Person, TreeNode, Branch } from "@/lib/types";
import { displayBirthDates } from "@/lib/hebrew-date";
import { formatDisplayName } from "@/lib/person-display";
import { sortPeopleByBirthDate } from "@/lib/sort-people";

export function buildTree(people: Person[], branches: Branch[] = []): TreeNode[] {
  const branchById = new Map(branches.map((b) => [b.id, b]));
  const branchByRoot = new Map(
    branches
      .filter((b) => b.root_person_id)
      .map((b) => [b.root_person_id!, b])
  );
  const byId = new Map<string, Person>();
  const childrenMap = new Map<string, Person[]>();

  for (const person of people) {
    byId.set(person.id, person);
    if (person.parent_id) {
      const siblings = childrenMap.get(person.parent_id) ?? [];
      siblings.push(person);
      childrenMap.set(person.parent_id, siblings);
    }
    if (person.parent2_id && person.parent2_id !== person.parent_id) {
      const siblings = childrenMap.get(person.parent2_id) ?? [];
      if (!siblings.some((p) => p.id === person.id)) {
        siblings.push(person);
        childrenMap.set(person.parent2_id, siblings);
      }
    }
  }

  const collectChildren = (person: Person): Person[] => {
    const seen = new Set<string>();
    const result: Person[] = [];

    const addFromParent = (parentId: string) => {
      for (const child of childrenMap.get(parentId) ?? []) {
        if (seen.has(child.id)) continue;
        if (child.id === person.spouse_id) continue;
        seen.add(child.id);
        result.push(child);
      }
    };

    addFromParent(person.id);
    if (person.spouse_id) addFromParent(person.spouse_id);

    return sortPeopleByBirthDate(result);
  };

  const buildSpouseNode = (spousePerson: Person): TreeNode => ({
    id: spousePerson.id,
    name: formatDisplayName(spousePerson, "full"),
    nickname: spousePerson.nickname,
    maiden_name: spousePerson.maiden_name,
    generation: spousePerson.generation,
    photo_url: spousePerson.photo_url,
    birthDateGregorian: spousePerson.birth_date_gregorian,
    birthDateHebrew: displayBirthDates(
      spousePerson.birth_date_gregorian,
      spousePerson.birth_date_hebrew
    ).hebrew,
    gender: spousePerson.gender,
    children: [],
  });

  const filterSiblingSpouseDuplicates = (children: Person[]): Person[] => {
    const ids = new Set(children.map((c) => c.id));
    return children.filter((child) => {
      if (!child.spouse_id || !ids.has(child.spouse_id)) return true;
      return child.id < child.spouse_id;
    });
  };

  const toNode = (person: Person): TreeNode => {
    const children = filterSiblingSpouseDuplicates(collectChildren(person))
      .filter((child) => child.spouse_id !== person.id)
      .map(toNode);

    let spouse: TreeNode | undefined;
    if (person.spouse_id) {
      const spousePerson = byId.get(person.spouse_id);
      if (spousePerson) spouse = buildSpouseNode(spousePerson);
    }

    let familyPhotoUrl: string | null = null;
    if (person.branch_id) {
      familyPhotoUrl = branchById.get(person.branch_id)?.photo_url ?? null;
    } else if (person.generation === 2) {
      familyPhotoUrl = branchByRoot.get(person.id)?.photo_url ?? null;
    }

    return {
      id: person.id,
      name: formatDisplayName(person, "full"),
      nickname: person.nickname,
      maiden_name: person.maiden_name,
      generation: person.generation,
      photo_url: person.photo_url,
      birthDateGregorian: person.birth_date_gregorian,
      familyPhotoUrl,
      birthDateHebrew: displayBirthDates(
        person.birth_date_gregorian,
        person.birth_date_hebrew
      ).hebrew,
      gender: person.gender,
      children,
      spouse,
    };
  };

  const isRootDisplayPerson = (person: Person): boolean => {
    if (person.parent_id) return false;
    if (!person.spouse_id) return true;
    const spouse = byId.get(person.spouse_id);
    if (spouse && !spouse.parent_id) {
      // שני בני הזוג בשורש — מציגים יחידה אחת (לפי id יציב)
      return person.id < spouse.id;
    }
    return true;
  };

  const roots = people
    .filter(isRootDisplayPerson)
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
