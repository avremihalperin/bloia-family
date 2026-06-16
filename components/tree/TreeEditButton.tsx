"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeEditButtonProps {
  personId: string;
}

export function TreeEditButton({ personId }: TreeEditButtonProps) {
  return (
    <Link
      href={`/person/${personId}/edit`}
      title="עריכת פרופיל"
      aria-label="עריכת פרופיל"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "absolute top-1.5 end-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-[#c4a055]/50 bg-white/95 text-[#8b6914] shadow-sm transition-all",
        "hover:border-[#8b6914] hover:bg-[#faf7f2] hover:shadow-md"
      )}
    >
      <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
    </Link>
  );
}
