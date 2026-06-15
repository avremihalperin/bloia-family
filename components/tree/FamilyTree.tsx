"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { TreeNode } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FamilyTreeProps {
  nodes: TreeNode[];
}

const generationStyles: Record<number, string> = {
  1: "border-t-[#8b6914] bg-white/90",
  2: "border-t-[#c4a055] bg-white/85",
  3: "border-t-[#d4b87a] bg-white/80",
  4: "border-t-[#e8d5a3] bg-white/75",
  5: "border-t-[#f0e6c8] bg-white/70",
};

function TreeNodeCard({ node }: { node: TreeNode }) {
  const gen = node.generation ?? 0;
  const style = generationStyles[gen] || "border-t-stone-300 bg-white/70";

  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/person/${node.id}`}
        className={cn(
          "group flex w-40 flex-col items-center rounded-2xl border border-[#c4a055]/20 border-t-[3px] p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c4a055]/40 hover:shadow-lg",
          style
        )}
      >
        <Avatar name={node.name} photoUrl={node.photo_url} size="md" />
        <p className="mt-2.5 text-center text-sm font-semibold text-[#1a1714] group-hover:text-[#8b6914]">
          {node.name}
        </p>
        {node.nickname && (
          <p className="text-xs text-stone-400">&quot;{node.nickname}&quot;</p>
        )}
        {node.birthYear && (
          <p className="text-xs text-stone-400">{node.birthYear}</p>
        )}
        {node.familyPhotoUrl && (
          <div className="mt-2 w-full overflow-hidden rounded-lg border border-[#c4a055]/20">
            <Image
              src={node.familyPhotoUrl}
              alt={`תמונה משפחתית — ${node.name}`}
              width={144}
              height={96}
              className="h-14 w-full object-cover"
              unoptimized
            />
            <p className="bg-[#c4a055]/10 px-1 py-0.5 text-center text-[10px] text-[#8b6914]">
              תמונה משפחתית
            </p>
          </div>
        )}
      </Link>

      {node.spouse && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-[#c4a055]">ו</span>
          <Link
            href={`/person/${node.spouse.id}`}
            className="rounded-lg border border-dashed border-[#c4a055]/30 px-2.5 py-1 text-xs text-stone-600 transition-colors hover:border-[#c4a055]/60 hover:bg-[#c4a055]/5"
          >
            {node.spouse.name}
          </Link>
        </div>
      )}

      {node.children.length > 0 && (
        <>
          <div className="my-3 h-8 w-px bg-gradient-to-b from-[#c4a055]/60 to-[#c4a055]/10" />
          <div className="flex flex-wrap justify-center gap-8">
            {node.children.map((child) => (
              <TreeNodeCard key={child.id} node={child} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function FamilyTree({ nodes }: FamilyTreeProps) {
  const [scale, setScale] = useState(1);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setScale((s) => Math.min(s + 0.1, 2))}>
          +
        </Button>
        <Button size="sm" variant="outline" onClick={() => setScale((s) => Math.max(s - 0.1, 0.4))}>
          −
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setScale(1)}>
          איפוס
        </Button>
      </div>
      <div className="overflow-auto rounded-2xl border border-[#c4a055]/15 bg-white/40 p-10 shadow-inner">
        <div
          className="inline-flex min-w-full justify-center transition-transform duration-300 origin-top"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="flex flex-wrap justify-center gap-12">
            {nodes.map((node) => (
              <TreeNodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
