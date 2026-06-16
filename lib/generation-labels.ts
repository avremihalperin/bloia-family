/** מינוח עץ המשפחה לפי דור */
const ROLE_BY_GENERATION: Record<number, string> = {
  1: "שורש",
  2: "ענף",
  3: "חוטר",
  4: "נצר",
};

export function generationRoleName(generation: number | null | undefined): string {
  if (!generation) return "—";
  return ROLE_BY_GENERATION[generation] ?? `דור ${generation}`;
}

export function generationBadgeLabel(generation: number | null | undefined): string {
  if (!generation) return "—";
  const role = ROLE_BY_GENERATION[generation];
  if (role) return `${role} (דור ${generation})`;
  return `דור ${generation}`;
}

export function generationFilterOptions() {
  return [
    { value: "", label: "כל הדורות" },
    { value: "1", label: "שורש (דור 1)" },
    { value: "2", label: "ענף (דור 2)" },
    { value: "3", label: "חוטר (דור 3)" },
    { value: "4", label: "נצר (דור 4)" },
    { value: "5", label: "דור 5" },
    { value: "6", label: "דור 6+" },
  ];
}
