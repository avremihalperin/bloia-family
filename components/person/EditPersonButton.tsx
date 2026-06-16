"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditPersonButtonProps {
  personId: string;
  size?: "sm" | "default";
  className?: string;
}

export function EditPersonButton({
  personId,
  size = "sm",
  className,
}: EditPersonButtonProps) {
  return (
    <Link
      href={`/person/${personId}/edit`}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#c4a055]/40 bg-white/60 font-medium text-[#1a1714] transition-all duration-200 hover:border-[#c4a055] hover:bg-[#faf7f2]",
        size === "sm" ? "h-8 px-3.5 text-sm" : "h-10 px-5 text-sm",
        className
      )}
    >
      <Pencil className="h-3.5 w-3.5" aria-hidden />
      עריכה
    </Link>
  );
}
