"use client";

import { useMemo } from "react";
import {
  type SankeyLinkLayout,
  type SankeyNodeLayout,
  computeSankeyLayout,
  sankeyLinkPath,
} from "@/lib/sankey/layout";
import { cn } from "@/lib/utils";

export type SankeyHoverTarget =
  | { kind: "link"; link: SankeyLinkLayout; x: number; y: number }
  | { kind: "node"; node: SankeyNodeLayout; x: number; y: number }
  | null;

interface SankeySvgProps {
  nodes: Parameters<typeof computeSankeyLayout>[0];
  links: Parameters<typeof computeSankeyLayout>[1];
  width: number;
  height: number;
  ariaLabel: string;
  /** Optional hover hooks. Called with screen-coordinate x/y. */
  onHover?: (target: SankeyHoverTarget) => void;
}

const MARGIN = { top: 8, right: 8, bottom: 8, left: 8 };
const NODE_LABEL_OFFSET = 6;
const MAX_LABEL_CHARS = 14;

export function SankeySvg({
  nodes,
  links,
  width,
  height,
  ariaLabel,
  onHover,
}: SankeySvgProps) {
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const layout = useMemo(
    () =>
      computeSankeyLayout(nodes, links, {
        width: innerWidth,
        height: innerHeight,
      }),
    [nodes, links, innerWidth, innerHeight],
  );

  if (layout.nodes.length === 0) {
    return null;
  }

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="overflow-visible"
    >
      <title>{ariaLabel}</title>
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        {/* Links rendered first so nodes sit on top. */}
        <g aria-hidden="true">
          {layout.links.map((link) => {
            const sourceNode = layout.nodes.find((n) => n.id === link.source);
            const targetNode = layout.nodes.find((n) => n.id === link.target);
            if (!sourceNode || !targetNode) return null;
            const path = sankeyLinkPath(link, sourceNode.x1, targetNode.x0);
            return (
              <path
                key={`${link.source}->${link.target}`}
                d={path}
                fill="none"
                stroke={link.sourceColor}
                strokeOpacity={0.4}
                strokeWidth={link.width}
                className="transition-opacity motion-reduce:transition-none hover:opacity-80"
                onMouseMove={(e) =>
                  onHover?.({
                    kind: "link",
                    link,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onMouseLeave={() => onHover?.(null)}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {layout.nodes.map((node) => {
            const labelOnLeft = node.level === 2;
            const truncated =
              node.label.length > MAX_LABEL_CHARS
                ? `${node.label.slice(0, MAX_LABEL_CHARS - 1)}…`
                : node.label;
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`${node.label}: ${node.value.toLocaleString("ja-JP")}円`}
                onMouseMove={(e) =>
                  onHover?.({
                    kind: "node",
                    node,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onMouseLeave={() => onHover?.(null)}
                onFocus={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onHover?.({
                    kind: "node",
                    node,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onBlur={() => onHover?.(null)}
                className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <rect
                  x={node.x0}
                  y={node.y0}
                  width={node.x1 - node.x0}
                  height={Math.max(1, node.y1 - node.y0)}
                  fill={node.color ?? "#94a3b8"}
                  rx={2}
                />
                <text
                  x={labelOnLeft ? node.x0 - NODE_LABEL_OFFSET : node.x1 + NODE_LABEL_OFFSET}
                  y={(node.y0 + node.y1) / 2}
                  dy="0.35em"
                  textAnchor={labelOnLeft ? "end" : "start"}
                  className={cn(
                    "fill-foreground text-[11px] font-medium pointer-events-none",
                  )}
                >
                  {truncated}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}
