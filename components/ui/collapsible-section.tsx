"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="overflow-hidden rounded-2xl border border-[#c4a055]/15 bg-white/60 shadow-sm">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-4 px-6 py-4 text-right transition-colors hover:bg-[#c4a055]/5"
      >
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-[#1a1714]">{title}</h3>
            {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
          </div>
          {badge !== undefined && badge !== null && Number(badge) > 0 && (
            <span className="shrink-0 rounded-full bg-[#c4a055]/15 px-3 py-1 text-sm font-medium text-[#8b6914]">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-[#8b6914] transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div id={panelId} className="border-t border-[#c4a055]/10 px-6 py-5">
          {children}
        </div>
      )}
    </div>
  );
}
