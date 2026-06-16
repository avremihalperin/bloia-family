"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { TreeNode } from "@/lib/types";
import { genderCardClasses, genderNameClasses } from "@/lib/gender-colors";
import { visiblePhotoUrl } from "@/lib/photo-visibility";
import {
  collectExpandableNodeIds,
  countDescendants,
  DEFAULT_TREE_EXPAND_DEPTH,
  getDefaultExpandedIds,
} from "@/lib/tree-expand";
import { TreeAddMenu } from "@/components/tree/TreeAddMenu";
import { TreeEditButton } from "@/components/tree/TreeEditButton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FamilyTreeProps {
  nodes: TreeNode[];
  editableIds?: string[];
}

const connectorStroke = "#c4a055";
const CARD_W = 176; // w-44 @ 16px
const GAP = 40; // gap-10 @ 16px — בין אחים
const COUPLE_GAP = 24; // gap-6 @ 16px — בין בני זוג
const DROP = 24; // h-6 @ 16px
const CARD_WIDTH_CLASS = "w-44";
const CARD_HEIGHT_CLASS = "h-[168px]";
const COUPLE_GAP_CLASS = "gap-6";
const COUPLE_BOTTOM_PAD_CLASS = "pb-6";
/** מרכז האווטאר בכרטיס: padding-top (16) + חצי גובה אווטאר md (24) */
const AVATAR_CENTER_Y = 40;

function childRowWidthPx(count: number) {
  return count * CARD_W + (count - 1) * GAP;
}

function childCenterXPx(index: number) {
  return index * (CARD_W + GAP) + CARD_W / 2;
}

function pxToRem(px: number) {
  return `${px / 16}rem`;
}

/** קווי חיבור לילדים — branchOnly: רק אופקי + ירידות (ה-stem מגיע מזוג ההורים) */
function ChildrenConnector({
  count,
  branchOnly = false,
}: {
  count: number;
  branchOnly?: boolean;
}) {
  if (count <= 1) {
    return (
      <svg
        viewBox={`0 0 1 ${DROP}`}
        width="1"
        height={pxToRem(DROP)}
        className="block shrink-0 overflow-visible"
        aria-hidden
      >
        <line
          x1={0.5}
          y1={0}
          x2={0.5}
          y2={DROP}
          stroke={connectorStroke}
          strokeWidth={1}
          opacity={0.5}
        />
      </svg>
    );
  }

  const width = childRowWidthPx(count);
  const junctionY = branchOnly ? 0 : DROP;
  const height = branchOnly ? DROP : DROP * 2;
  const centerX = width / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={pxToRem(width)}
      height={pxToRem(height)}
      className="block shrink-0 overflow-visible"
      aria-hidden
    >
      {!branchOnly && (
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={DROP}
          stroke={connectorStroke}
          strokeWidth={1}
          opacity={0.5}
        />
      )}
      <line
        x1={CARD_W / 2}
        y1={junctionY}
        x2={width - CARD_W / 2}
        y2={junctionY}
        stroke={connectorStroke}
        strokeWidth={1}
        opacity={0.5}
      />
      {Array.from({ length: count }, (_, i) => (
        <line
          key={i}
          x1={childCenterXPx(i)}
          y1={junctionY}
          x2={childCenterXPx(i)}
          y2={height}
          stroke={connectorStroke}
          strokeWidth={1}
          opacity={0.5}
        />
      ))}
    </svg>
  );
}

/** כפתור פתיחה/סגירה של ענף ילדים */
function BranchToggle({
  expanded,
  childCount,
  descendantCount,
  onToggle,
}: {
  expanded: boolean;
  childCount: number;
  descendantCount: number;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col items-center" dir="ltr">
      <div className="h-4 w-px shrink-0 bg-[#c4a055]/50" aria-hidden />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={expanded ? "צמצם ענף" : `הצג ${childCount} ילדים`}
        className={cn(
          "z-20 flex items-center gap-1.5 rounded-full border border-[#c4a055]/40 bg-white px-3 py-1 text-xs font-medium text-[#8b6914] shadow-sm",
          "transition-colors hover:border-[#8b6914] hover:bg-[#faf7f2]"
        )}
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
            צמצם ענף
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {childCount} {childCount === 1 ? "ילד/ה" : "ילדים"}
            {descendantCount > childCount && (
              <span className="text-stone-400">({descendantCount} סה״כ)</span>
            )}
          </>
        )}
      </button>
    </div>
  );
}

/** קווים מההורים לילדים */
function ChildrenBranch({
  children,
  showWomenPhotos,
  editableIds,
  expandedIds,
  onToggleExpand,
  branchOnly = false,
}: {
  children: TreeNode[];
  showWomenPhotos: boolean;
  editableIds: Set<string>;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  branchOnly?: boolean;
}) {
  if (children.length === 1) {
    return (
      <div className="flex flex-col items-center" dir="ltr">
        <ChildrenConnector count={1} branchOnly={branchOnly} />
        <TreeNodeUnit
          node={children[0]}
          showWomenPhotos={showWomenPhotos}
          editableIds={editableIds}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
        />
      </div>
    );
  }

  const rowWidth = pxToRem(childRowWidthPx(children.length));

  return (
    <div className="flex flex-col items-center" dir="ltr">
      <ChildrenConnector count={children.length} branchOnly={branchOnly} />
      <div className="flex items-start gap-10" style={{ width: rowWidth }}>
        {children.map((child) => (
          <div key={child.id} className={cn("shrink-0", CARD_WIDTH_CLASS)}>
            <TreeNodeUnit
              node={child}
              showWomenPhotos={showWomenPhotos}
              editableIds={editableIds}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonCard({
  node,
  showWomenPhotos,
  canEdit,
}: {
  node: TreeNode;
  showWomenPhotos: boolean;
  canEdit: boolean;
}) {
  const photoUrl = visiblePhotoUrl(
    node.photo_url,
    node.gender,
    node.birthDateGregorian,
    showWomenPhotos
  );

  return (
    <div className={cn("relative z-10 shrink-0", CARD_WIDTH_CLASS)}>
      {canEdit && (
        <>
          <TreeAddMenu node={node} />
          <TreeEditButton personId={node.id} />
        </>
      )}
      <Link
        href={`/person/${node.id}`}
        dir="rtl"
        className={cn(
          "group flex flex-col items-center rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
          CARD_WIDTH_CLASS,
          CARD_HEIGHT_CLASS,
          genderCardClasses(node.gender)
        )}
      >
        <Avatar name={node.name} photoUrl={photoUrl} size="md" gender={node.gender} />
        <div className="mt-2.5 flex w-full min-h-0 flex-1 flex-col items-center">
          <p
            className={cn(
              "line-clamp-2 w-full text-center text-sm leading-snug",
              genderNameClasses(node.gender)
            )}
          >
            {node.name}
          </p>
          <p className="mt-1 line-clamp-1 h-4 w-full text-center text-xs text-stone-400">
            {node.nickname ? `"${node.nickname}"` : "\u00a0"}
          </p>
          <p className="mt-0.5 line-clamp-1 h-4 w-full text-center text-[11px] leading-snug text-stone-500">
            {node.birthDateHebrew ?? "\u00a0"}
          </p>
        </div>
      </Link>
    </div>
  );
}

/** קווי חיבור בין בני זוג ולילדים */
function CoupleConnectors({ hasChildren }: { hasChildren: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* קו אופקי ממרכז כרטיס לכרטיס (עובר ברווח ביניהם) */}
      <div
        className="absolute h-px bg-[#c4a055]/50"
        style={{
          top: pxToRem(AVATAR_CENTER_Y),
          left: pxToRem(CARD_W / 2),
          width: pxToRem(CARD_W + COUPLE_GAP),
        }}
      />
      {/* קו אנכי מהמרכז למטה — מתחבר לענף הילדים */}
      {hasChildren && (
        <div
          className="absolute left-1/2 w-px -translate-x-1/2 bg-[#c4a055]/50"
          style={{
            top: pxToRem(AVATAR_CENTER_Y),
            height: `calc(100% - ${pxToRem(AVATAR_CENTER_Y)})`,
          }}
        />
      )}
    </div>
  );
}

/** קו אנכי מיחיד לילדים */
function SingleParentConnector({ hasChildren }: { hasChildren: boolean }) {
  if (!hasChildren) return null;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute left-1/2 w-px -translate-x-1/2 bg-[#c4a055]/50"
        style={{
          top: pxToRem(AVATAR_CENTER_Y),
          height: `calc(100% - ${pxToRem(AVATAR_CENTER_Y)})`,
        }}
      />
    </div>
  );
}

function TreeNodeUnit({
  node,
  showWomenPhotos,
  editableIds,
  expandedIds,
  onToggleExpand,
}: {
  node: TreeNode;
  showWomenPhotos: boolean;
  editableIds: Set<string>;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  const spouse = node.spouse;
  const hasChildren = node.children.length > 0;
  const isExpanded = !hasChildren || expandedIds.has(node.id);
  const canEdit = editableIds.has(node.id);

  return (
    <div className="flex flex-col items-center" dir="ltr">
      <div
        className={cn(
          "relative flex items-start",
          hasChildren && COUPLE_BOTTOM_PAD_CLASS,
          spouse && COUPLE_GAP_CLASS
        )}
      >
        {spouse ? (
          <CoupleConnectors hasChildren={hasChildren} />
        ) : (
          <SingleParentConnector hasChildren={hasChildren} />
        )}
        <PersonCard node={node} showWomenPhotos={showWomenPhotos} canEdit={canEdit} />
        {spouse && (
          <PersonCard
            node={spouse}
            showWomenPhotos={showWomenPhotos}
            canEdit={editableIds.has(spouse.id)}
          />
        )}
      </div>

      {hasChildren && (
        <div className="flex flex-col items-center">
          <BranchToggle
            expanded={isExpanded}
            childCount={node.children.length}
            descendantCount={countDescendants(node)}
            onToggle={() => onToggleExpand(node.id)}
          />
          {isExpanded && (
            <ChildrenBranch
              children={node.children}
              showWomenPhotos={showWomenPhotos}
              editableIds={editableIds}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              branchOnly
            />
          )}
        </div>
      )}
    </div>
  );
}

export function FamilyTree({ nodes, editableIds = [] }: FamilyTreeProps) {
  const [scale, setScale] = useState(1);
  const [showWomenPhotos, setShowWomenPhotos] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    getDefaultExpandedIds(nodes, DEFAULT_TREE_EXPAND_DEPTH)
  );
  const editableSet = new Set(editableIds);

  useEffect(() => {
    const expandable = collectExpandableNodeIds(nodes);
    setExpandedIds((prev) => {
      const defaults = getDefaultExpandedIds(nodes, DEFAULT_TREE_EXPAND_DEPTH);
      const next = new Set<string>();
      for (const id of prev) {
        if (expandable.has(id)) next.add(id);
      }
      for (const id of defaults) {
        next.add(id);
      }
      return next;
    });
  }, [nodes]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(collectExpandableNodeIds(nodes));
  }, [nodes]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const resetExpand = useCallback(() => {
    setExpandedIds(getDefaultExpandedIds(nodes, DEFAULT_TREE_EXPAND_DEPTH));
  }, [nodes]);

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
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={expandAll}>
            פתח הכל
          </Button>
          <Button size="sm" variant="outline" onClick={collapseAll}>
            סגור הכל
          </Button>
          <Button size="sm" variant="ghost" onClick={resetExpand}>
            ברירת מחדל
          </Button>
          <span className="hidden h-5 w-px bg-[#c4a055]/25 sm:block" aria-hidden />
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
              <TreeNodeUnit
                key={node.id}
                node={node}
                showWomenPhotos={showWomenPhotos}
                editableIds={editableSet}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
