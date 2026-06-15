"use client";

import { useState } from "react";
import Link from "next/link";
import type { TreeNode } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FamilyTreeProps {
  nodes: TreeNode[];
}

const generationColors: Record<number, string> = {
  1: "border-amber-600 bg-amber-50",
  2: "border-orange-500 bg-orange-50",
  3: "border-yellow-600 bg-yellow-50",
  4: "border-lime-600 bg-lime-50",
  5: "border-green-600 bg-green-50",
};

function TreeNodeCard({ node }: { node: TreeNode }) {
  const gen = node.generation ?? 0;
  const color = generationColors[gen] || "border-stone-400 bg-stone-50";

  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/person/${node.id}`}
        className={cn(
          "flex w-36 flex-col items-center rounded-xl border-2 p-3 transition hover:shadow-md",
          color
        )}
      >
        <Avatar name={node.name} photoUrl={node.photo_url} size="md" />
        <p className="mt-2 text-center text-sm font-semibold">{node.name}</p>
        {node.nickname && (
          <p className="text-xs text-stone-500">&quot;{node.nickname}&quot;</p>
        )}
        {node.birthYear && (
          <p className="text-xs text-stone-500">{node.birthYear}</p>
        )}
      </Link>

      {node.spouse && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-stone-400">ו</span>
          <Link
            href={`/person/${node.spouse.id}`}
            className="rounded-lg border border-dashed border-stone-300 px-2 py-1 text-xs hover:bg-stone-50"
          >
            {node.spouse.name}
          </Link>
        </div>
      )}

      {node.children.length > 0 && (
        <>
          <div className="my-2 h-6 w-px bg-amber-300" />
          <div className="flex flex-wrap justify-center gap-6">
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
          -
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setScale(1)}>
          איפוס
        </Button>
      </div>
      <div className="overflow-auto rounded-xl border border-amber-100 bg-amber-50/30 p-8">
        <div
          className="inline-flex min-w-full justify-center transition-transform origin-top"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="flex flex-wrap justify-center gap-10">
            {nodes.map((node) => (
              <TreeNodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
