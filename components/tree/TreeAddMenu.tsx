"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TreeNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TreeAddMenuProps {
  node: TreeNode;
}

type MenuItem = {
  label: string;
  href: string;
  show?: boolean;
};

function menuItems(node: TreeNode): MenuItem[] {
  return [
    {
      label: "הוסף ילד/ה",
      href: `/person/${node.id}/add-child`,
      show: true,
    },
    {
      label: "הוסף אח/אחות",
      href: `/person/${node.id}/add-sibling`,
      show: Boolean(node.parent_id),
    },
    {
      label: node.parent_id ? "שנה הורה" : "קשר להורה",
      href: `/person/${node.id}/edit#parents`,
      show: true,
    },
    {
      label: node.hasLinkedSpouse ? "ערוך בן/בת זוג" : "קשר בן/בת זוג",
      href: `/person/${node.id}/edit#spouse`,
      show: true,
    },
    {
      label: "הוסף בן/בת זוג",
      href: `/person/${node.id}/add-spouse`,
      show: !node.hasLinkedSpouse,
    },
  ].filter((item) => item.show);
}

export function TreeAddMenu({ node }: TreeAddMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="absolute top-1.5 start-1.5 z-20">
      <button
        type="button"
        title="הוסף קשר משפחתי"
        aria-label="הוסף קשר משפחתי"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border border-[#c4a055]/50 bg-white/95 text-[#8b6914] shadow-sm transition-all",
          "hover:border-[#8b6914] hover:bg-[#faf7f2] hover:shadow-md",
          open && "border-[#8b6914] bg-[#faf7f2]"
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute top-full start-0 z-30 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-[#c4a055]/25 bg-white py-1 shadow-lg">
          {menuItems(node).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3.5 py-2 text-sm text-[#1a1714] transition-colors hover:bg-[#faf7f2] hover:text-[#8b6914]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
