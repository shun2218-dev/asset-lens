/**
 * Minimal 3-level Sankey layout.
 *
 * Built in-house instead of pulling `d3-sankey` because:
 *  - we only need 3 strict columns (root → category → leaf), no cycles
 *  - keeps client bundle small (no transitive d3 modules)
 *  - deterministic, easy to unit-test
 *
 * Layout algorithm:
 *   1. Group nodes by level (0, 1, 2) → three columns.
 *   2. Each node's `value` = max(sum of incoming links, sum of outgoing links).
 *   3. Per column: vertical scale = (height − padding gaps) / sum(node.value).
 *      Node height = node.value * scale.
 *   4. Stack column 1 by descending value so the dominant category sits on top.
 *      Stack column 2 grouped by parent category (preserves parent order),
 *      then by descending leaf value within each group → minimises crossings.
 *   5. For each node, allocate sub-bands for incoming / outgoing links sorted
 *      by the y-position of the opposite endpoint, so source-side and
 *      target-side widths line up naturally.
 */

export type SankeyLevel = 0 | 1 | 2;

export type SankeyNodeInput = {
  id: string;
  level: SankeyLevel;
  label: string;
  /** Optional ID of the parent category (level 1) used to group leaves (level 2). */
  parentId?: string;
  /** Hex colour for the node and its outbound links. */
  color?: string;
  /** Free-form metadata bag preserved on the laid-out node. */
  meta?: Record<string, unknown>;
};

export type SankeyLinkInput = {
  source: string;
  target: string;
  value: number;
};

export type SankeyNodeLayout = SankeyNodeInput & {
  value: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

export type SankeyLinkLayout = SankeyLinkInput & {
  sourceY: number;
  targetY: number;
  width: number;
  sourceColor: string;
};

export type SankeyLayoutOptions = {
  width: number;
  height: number;
  /** Width of each node rectangle. */
  nodeWidth?: number;
  /** Vertical gap between sibling nodes within a column. */
  nodePadding?: number;
  /** Fallback colour when a node has no `color`. */
  defaultColor?: string;
};

export type SankeyLayoutResult = {
  nodes: SankeyNodeLayout[];
  links: SankeyLinkLayout[];
  width: number;
  height: number;
};

const DEFAULT_NODE_WIDTH = 16;
const DEFAULT_NODE_PADDING = 12;
const DEFAULT_COLOR = "#94a3b8"; // slate-400

export function computeSankeyLayout(
  rawNodes: SankeyNodeInput[],
  rawLinks: SankeyLinkInput[],
  options: SankeyLayoutOptions,
): SankeyLayoutResult {
  const width = Math.max(0, options.width);
  const height = Math.max(0, options.height);
  const nodeWidth = options.nodeWidth ?? DEFAULT_NODE_WIDTH;
  const nodePadding = options.nodePadding ?? DEFAULT_NODE_PADDING;
  const defaultColor = options.defaultColor ?? DEFAULT_COLOR;

  if (rawNodes.length === 0 || rawLinks.length === 0) {
    return { nodes: [], links: [], width, height };
  }

  const nodesById = new Map<string, SankeyNodeLayout>();
  for (const n of rawNodes) {
    nodesById.set(n.id, {
      ...n,
      value: 0,
      x0: 0,
      x1: 0,
      y0: 0,
      y1: 0,
    });
  }

  // 1. Sum link values to derive node values.
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  for (const link of rawLinks) {
    if (link.value <= 0) continue;
    if (!nodesById.has(link.source) || !nodesById.has(link.target)) continue;
    incoming.set(link.target, (incoming.get(link.target) ?? 0) + link.value);
    outgoing.set(link.source, (outgoing.get(link.source) ?? 0) + link.value);
  }
  for (const node of nodesById.values()) {
    const inSum = incoming.get(node.id) ?? 0;
    const outSum = outgoing.get(node.id) ?? 0;
    node.value = Math.max(inSum, outSum);
  }

  // 2. Group by column.
  const columns: SankeyNodeLayout[][] = [[], [], []];
  for (const node of nodesById.values()) {
    if (node.value <= 0) continue;
    columns[node.level].push(node);
  }

  // 3. Column x positions: 0, mid, right. Three-column geometry only.
  const columnX = [0, (width - nodeWidth) / 2, width - nodeWidth];

  // 4. Sort & stack each column.
  // Column 0 (root): single node typically; centre it vertically.
  for (const node of columns[0]) {
    const total = columns[0].reduce((s, n) => s + n.value, 0) || 1;
    const usable = Math.max(0, height);
    const h = (node.value / total) * usable;
    node.x0 = columnX[0];
    node.x1 = node.x0 + nodeWidth;
    node.y0 = (usable - h) / 2;
    node.y1 = node.y0 + h;
  }

  // Column 1: sort by descending value for visual prominence.
  columns[1].sort((a, b) => b.value - a.value);
  layoutColumn(columns[1], columnX[1], nodeWidth, nodePadding, height);

  // Column 2: group by parent (preserve parent order from column 1),
  // then sort descending within each group.
  const parentOrder = new Map<string, number>();
  columns[1].forEach((n, idx) => parentOrder.set(n.id, idx));
  columns[2].sort((a, b) => {
    const pa = parentOrder.get(a.parentId ?? "") ?? Number.POSITIVE_INFINITY;
    const pb = parentOrder.get(b.parentId ?? "") ?? Number.POSITIVE_INFINITY;
    if (pa !== pb) return pa - pb;
    return b.value - a.value;
  });
  layoutColumn(columns[2], columnX[2], nodeWidth, nodePadding, height);

  // 5. Allocate link bands.
  // For every node, sort outgoing links by target node y and incoming links
  // by source node y, then walk each list to assign cumulative offsets.
  const orderedNodes = Array.from(nodesById.values());
  const yOf = (id: string) => nodesById.get(id)?.y0 ?? 0;

  type LinkInProgress = SankeyLinkLayout & { _sourceOffset: number; _targetOffset: number };
  const draftLinks: LinkInProgress[] = rawLinks
    .filter(
      (l) =>
        l.value > 0 && nodesById.has(l.source) && nodesById.has(l.target),
    )
    .map((l) => ({
      ...l,
      sourceY: 0,
      targetY: 0,
      width: 0,
      sourceColor: nodesById.get(l.source)?.color ?? defaultColor,
      _sourceOffset: 0,
      _targetOffset: 0,
    }));

  for (const node of orderedNodes) {
    const nodeHeight = Math.max(0, node.y1 - node.y0);
    const totalOut = outgoing.get(node.id) ?? 0;
    const totalIn = incoming.get(node.id) ?? 0;

    if (totalOut > 0) {
      const out = draftLinks
        .filter((l) => l.source === node.id)
        .sort((a, b) => yOf(a.target) - yOf(b.target));
      let cursor = node.y0;
      for (const link of out) {
        const w = (link.value / totalOut) * nodeHeight;
        link.sourceY = cursor + w / 2;
        link._sourceOffset = w;
        cursor += w;
      }
    }
    if (totalIn > 0) {
      const inc = draftLinks
        .filter((l) => l.target === node.id)
        .sort((a, b) => yOf(a.source) - yOf(b.source));
      let cursor = node.y0;
      for (const link of inc) {
        const w = (link.value / totalIn) * nodeHeight;
        link.targetY = cursor + w / 2;
        link._targetOffset = w;
        cursor += w;
      }
    }
  }

  // Final stroke width: pick the smaller of source/target band widths so the
  // ribbon never visually overflows either node.
  const links: SankeyLinkLayout[] = draftLinks.map(
    ({ _sourceOffset, _targetOffset, ...rest }) => ({
      ...rest,
      width: Math.max(1, Math.min(_sourceOffset, _targetOffset)),
    }),
  );

  return {
    nodes: orderedNodes.filter((n) => n.value > 0),
    links,
    width,
    height,
  };
}

function layoutColumn(
  column: SankeyNodeLayout[],
  x: number,
  nodeWidth: number,
  nodePadding: number,
  height: number,
): void {
  if (column.length === 0) return;
  const totalValue = column.reduce((s, n) => s + n.value, 0);
  if (totalValue <= 0) return;
  const totalPadding = nodePadding * Math.max(0, column.length - 1);
  const usable = Math.max(0, height - totalPadding);
  const scale = usable / totalValue;

  let cursor = 0;
  for (const node of column) {
    node.x0 = x;
    node.x1 = x + nodeWidth;
    node.y0 = cursor;
    node.y1 = cursor + node.value * scale;
    cursor = node.y1 + nodePadding;
  }
}

/**
 * Generate an SVG path string for a sankey link.
 * Uses a horizontal cubic bezier so links read left-to-right.
 */
export function sankeyLinkPath(
  link: SankeyLinkLayout,
  sourceX: number,
  targetX: number,
): string {
  const xMid = (sourceX + targetX) / 2;
  return [
    `M${sourceX},${link.sourceY}`,
    `C${xMid},${link.sourceY}`,
    `${xMid},${link.targetY}`,
    `${targetX},${link.targetY}`,
  ].join(" ");
}
