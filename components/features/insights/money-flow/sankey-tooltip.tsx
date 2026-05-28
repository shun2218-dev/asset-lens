"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { SankeyHoverTarget } from "./sankey-svg";

interface SankeyTooltipProps {
  target: SankeyHoverTarget;
  /** Total expense in JPY for percentage-of-total computation. */
  total: number;
  /** Map of node id -> node value, for percentage-of-source. */
  nodeValues: Map<string, number>;
  /** Map of node id -> human label, for link source/target rendering. */
  nodeLabels: Map<string, string>;
}

const OFFSET = 16;

export function SankeyTooltip({
  target,
  total,
  nodeValues,
  nodeLabels,
}: SankeyTooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!target) {
      setPos(null);
      return;
    }
    setPos({ x: target.x, y: target.y });
  }, [target]);

  if (!target || !pos) return null;

  const pctOfTotal = (value: number) =>
    total > 0 ? `${Math.round((value / total) * 100)}%` : "—";

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none fixed z-50 max-w-xs rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md",
      )}
      style={{ left: pos.x + OFFSET, top: pos.y + OFFSET }}
    >
      {target.kind === "link" ? (
        <LinkBody
          source={nodeLabels.get(target.link.source) ?? target.link.source}
          target={nodeLabels.get(target.link.target) ?? target.link.target}
          value={target.link.value}
          sourceValue={nodeValues.get(target.link.source) ?? 0}
          pctOfTotal={pctOfTotal(target.link.value)}
        />
      ) : (
        <NodeBody label={target.node.label} value={target.node.value} />
      )}
    </div>
  );
}

function LinkBody({
  source,
  target,
  value,
  sourceValue,
  pctOfTotal,
}: {
  source: string;
  target: string;
  value: number;
  sourceValue: number;
  pctOfTotal: string;
}) {
  const pctOfSource =
    sourceValue > 0 ? `${Math.round((value / sourceValue) * 100)}%` : "—";
  return (
    <div className="space-y-1">
      <div className="font-medium">
        {source} → {target}
      </div>
      <div className="tabular-nums text-foreground">
        ¥{value.toLocaleString("ja-JP")}
      </div>
      <div className="text-muted-foreground text-[11px]">
        {source} の {pctOfSource} ・ 全体の {pctOfTotal}
      </div>
    </div>
  );
}

function NodeBody({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="font-medium">{label}</div>
      <div className="tabular-nums text-foreground">
        ¥{value.toLocaleString("ja-JP")}
      </div>
    </div>
  );
}
