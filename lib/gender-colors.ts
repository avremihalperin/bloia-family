import type { Gender } from "@/lib/types";
import { cn } from "@/lib/utils";

/** תכלכל לבנים, ורדרד לבנות */
const male = {
  accent: "border-t-[#3da8a8]",
  surface: "border-[#4db8b8]/30 bg-[#e6f5f5]/95",
  surfaceHover: "hover:border-[#4db8b8]/55 hover:bg-[#dff0f0]",
  text: "text-[#1a6b6b]",
  textHover: "hover:text-[#0f5555]",
  row: "border-[#4db8b8]/25 bg-[#e6f5f5]/70 hover:border-[#4db8b8]/45 hover:bg-[#dff0f0]",
  link: "text-[#1a6b6b] hover:text-[#0f5555]",
  ring: "ring-[#4db8b8]/50",
  placeholder: "from-[#a8dede] to-[#4db8b8] text-[#0f4444]",
  topBar: "from-[#2a9d9d] via-[#4db8b8] to-[#8fd4d4]",
  chip: "border-[#4db8b8]/35 bg-[#e6f5f5] text-[#1a6b6b] hover:border-[#4db8b8]/60 hover:bg-[#d4ecec]",
};

const female = {
  accent: "border-t-[#c96d88]",
  surface: "border-[#d4849a]/30 bg-[#fdf0f4]/95",
  surfaceHover: "hover:border-[#d4849a]/55 hover:bg-[#fce8ee]",
  text: "text-[#8f3d58]",
  textHover: "hover:text-[#732f47]",
  row: "border-[#d4849a]/25 bg-[#fdf0f4]/70 hover:border-[#d4849a]/45 hover:bg-[#fce8ee]",
  link: "text-[#8f3d58] hover:text-[#732f47]",
  ring: "ring-[#d4849a]/50",
  placeholder: "from-[#f0c0d0] to-[#d4849a] text-[#5c2035]",
  topBar: "from-[#b85a75] via-[#d4849a] to-[#e8b8c8]",
  chip: "border-[#d4849a]/35 bg-[#fdf0f4] text-[#8f3d58] hover:border-[#d4849a]/60 hover:bg-[#fce8ee]",
};

const neutral = {
  accent: "border-t-[#c4a055]",
  surface: "border-[#c4a055]/20 bg-white/90",
  surfaceHover: "hover:border-[#c4a055]/40",
  text: "text-[#1a1714]",
  textHover: "hover:text-[#8b6914]",
  row: "border-[#c4a055]/15 bg-white/60 hover:border-[#c4a055]/35 hover:bg-white",
  link: "text-[#1a1714] hover:text-[#8b6914]",
  ring: "ring-[#c4a055]/40",
  placeholder: "from-[#e8d5a3] to-[#c4a055] text-[#1a1714]",
  topBar: "from-[#8b6914] via-[#c4a055] to-[#e8d5a3]",
  chip: "border-[#c4a055]/30 text-stone-600 hover:border-[#c4a055]/60 hover:bg-[#c4a055]/5",
};

function palette(gender: Gender | null | undefined) {
  if (gender === "male") return male;
  if (gender === "female") return female;
  return neutral;
}

export function genderCardClasses(gender: Gender | null | undefined, className?: string) {
  const p = palette(gender);
  return cn(
    "border border-t-[3px]",
    p.accent,
    p.surface,
    p.surfaceHover,
    className
  );
}

export function genderNameClasses(gender: Gender | null | undefined, className?: string) {
  if (gender === "male") {
    return cn("font-semibold text-[#1a6b6b] group-hover:text-[#0f5555]", className);
  }
  if (gender === "female") {
    return cn("font-semibold text-[#8f3d58] group-hover:text-[#732f47]", className);
  }
  return cn("font-semibold text-[#1a1714] group-hover:text-[#8b6914]", className);
}

export function genderLinkClasses(gender: Gender | null | undefined, className?: string) {
  const p = palette(gender);
  return cn("font-medium transition-colors", p.link, className);
}

export function genderRowClasses(gender: Gender | null | undefined, className?: string) {
  const p = palette(gender);
  return cn(
    "rounded-xl border px-4 py-3 transition-all hover:shadow-md",
    p.row,
    className
  );
}

export function genderTopBarClasses(gender: Gender | null | undefined, className?: string) {
  const p = palette(gender);
  return cn("h-1 bg-gradient-to-l opacity-90 transition-opacity group-hover:opacity-100", p.topBar, className);
}

export function genderAvatarClasses(gender: Gender | null | undefined, className?: string) {
  const p = palette(gender);
  return cn(p.ring, className);
}

export function genderAvatarPlaceholderClasses(gender: Gender | null | undefined, className?: string) {
  const p = palette(gender);
  return cn("bg-gradient-to-br font-semibold shadow-sm", p.placeholder, className);
}

export function genderChipClasses(gender: Gender | null | undefined, className?: string) {
  const p = palette(gender);
  return cn(
    "rounded-lg border px-2.5 py-1 text-xs transition-colors",
    p.chip,
    className
  );
}

export function genderHeadingClasses(gender: Gender | null | undefined, className?: string) {
  if (gender === "male") return cn("text-[#1a6b6b]", className);
  if (gender === "female") return cn("text-[#8f3d58]", className);
  return cn("text-[#1a1714]", className);
}

export function genderTableRowClasses(gender: Gender | null | undefined) {
  if (gender === "male") return "hover:bg-[#e6f5f5]/80";
  if (gender === "female") return "hover:bg-[#fdf0f4]/80";
  return "hover:bg-[#c4a055]/5";
}
