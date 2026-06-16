import type { TreeNode } from "@/lib/types";

/** כמה רמות עומק פתוחות כברירת מחדל (שורש + ילדים, נכדים סגורים) */
export const DEFAULT_TREE_EXPAND_DEPTH = 2;

export function collectExpandableNodeIds(nodes: TreeNode[]): Set<string> {
  const ids = new Set<string>();
  const walk = (node: TreeNode) => {
    if (node.children.length > 0) {
      ids.add(node.id);
      node.children.forEach(walk);
    }
  };
  nodes.forEach(walk);
  return ids;
}

export function getDefaultExpandedIds(
  nodes: TreeNode[],
  maxDepth = DEFAULT_TREE_EXPAND_DEPTH
): Set<string> {
  const expanded = new Set<string>();

  const walk = (node: TreeNode, depth: number) => {
    if (node.children.length === 0) return;
    if (depth < maxDepth) {
      expanded.add(node.id);
      node.children.forEach((child) => walk(child, depth + 1));
    }
  };

  nodes.forEach((node) => walk(node, 0));
  return expanded;
}

export function countDescendants(node: TreeNode): number {
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}
