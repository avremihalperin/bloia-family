"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { TreeNode } from "@/lib/types";
import { genderCardClasses, genderNameClasses } from "@/lib/gender-colors";
import {
  visibleFamilyPhotoUrl,
  visiblePhotoUrl,
} from "@/lib/photo-visibility";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FamilyTreeProps {
  nodes: TreeNode[];
}

const connectorColor = "bg-[#c4a055]";

function PersonCard({
  node,
  showWomenPhotos,
}: {
  node: TreeNode;
  showWomenPhotos: boolean;
}) {
  const photoUrl = visiblePhotoUrl(
    node.photo_url,
    node.gender,
    node.birthDateGregorian,
    showWomenPhotos
  );
  const familyPhotoUrl = visibleFamilyPhotoUrl(
    node.familyPhotoUrl,
    node.gender,
    node.birthDateGregorian,
    showWomenPhotos
  );

  return (
    <Link
      href={`/person/${node.id}`}
      className={cn(
        "group flex w-44 shrink-0 flex-col items-center rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        genderCardClasses(node.gender)
      )}
    >
      <Avatar name={node.name} photoUrl={photoUrl} size="md" gender={node.gender} />
      <p className={cn("mt-2.5 text-center text-sm leading-snug", genderNameClasses(node.gender))}>
        {node.name}
      </p>
      {node.nickname && (
        <p className="text-xs text-stone-400">&quot;{node.nickname}&quot;</p>
      )}
      {node.birthDateHebrew && (
        <p className="mt-1 px-1 text-center text-[11px] leading-snug text-stone-500">
          {node.birthDateHebrew}
        </p>
      )}
      {familyPhotoUrl && (
        <div className="mt-2 w-full overflow-hidden rounded-lg border border-[#c4a055]/20">
          <Image
            src={familyPhotoUrl}
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
  );
}

/** קו אופקי בין שני כרטיסי בני זוג */
function CoupleHorizontalLine() {
  return (
    <div className="flex shrink-0 items-center self-center px-0.5" aria-hidden>
      <div className={cn("h-0.5 w-8 sm:w-12", connectorColor, "opacity-60")} />
    </div>
  );
}

function TreeNodeUnit({
  node,
  showWomenPhotos,
}: {
  node: TreeNode;
  showWomenPhotos: boolean;
}) {
  const spouse = node.spouse;
  const hasCouple = Boolean(spouse);
  const hasChildren = node.children.length > 0;
  const multipleChildren = node.children.length > 1;

  return (
    <div className="flex flex-col items-center">
      {/* זוג או יחיד */}
      <div className="relative flex items-start">
        <PersonCard node={node} showWomenPhotos={showWomenPhotos} />
        {spouse && (
          <>
            <CoupleHorizontalLine />
            <PersonCard node={spouse} showWomenPhotos={showWomenPhotos} />
          </>
        )}
      </div>

      {hasChildren && (
        <>
          {/* קו יורד מהזוג / מהאדם */}
          <div
            className={cn(
              "relative flex flex-col items-center",
              hasCouple ? "w-full min-w-[24rem]" : "w-full"
            )}
          >
            {hasCouple && (
              <div
                className={cn("h-0.5 w-[calc(100%-11rem)] max-w-xs", connectorColor, "opacity-40")}
                aria-hidden
              />
            )}
            <div
              className={cn("h-7 w-0.5", connectorColor, "opacity-50")}
              aria-hidden
            />
          </div>

          {/* קו אופקי מעל ילדים (כשיש יותר מאחד) */}
          {multipleChildren && (
            <div className="relative mb-0 flex w-full justify-center" aria-hidden>
              <div className={cn("h-0.5", connectorColor, "opacity-40")} style={{ width: `${Math.min(node.children.length * 12, 80)}%`, minWidth: "8rem" }} />
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-10 pt-1">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {multipleChildren && (
                  <div className={cn("mb-0 h-5 w-0.5", connectorColor, "opacity-40")} aria-hidden />
                )}
                <TreeNodeUnit node={child} showWomenPhotos={showWomenPhotos} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function FamilyTree({ nodes }: FamilyTreeProps) {
  const [scale, setScale] = useState(1);
  const [showWomenPhotos, setShowWomenPhotos] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#c4a055]/15 bg-white/70 px-4 py-3">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={showWomenPhotos}
            onChange={(e) => setShowWomenPhotos(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 accent-[#8b6914]"
          />
          <Label className="mb-0 cursor-pointer font-normal text-[#1a1714]">
            הצג תמונות נשים (מעל גיל 6)
          </Label>
        </label>
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
      </div>
      <div className="overflow-auto rounded-2xl border border-[#c4a055]/15 bg-white/40 p-10 shadow-inner">
        <div
          className="inline-flex min-w-full justify-center transition-transform duration-300 origin-top"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="flex flex-wrap justify-center gap-16">
            {nodes.map((node) => (
              <TreeNodeUnit key={node.id} node={node} showWomenPhotos={showWomenPhotos} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
