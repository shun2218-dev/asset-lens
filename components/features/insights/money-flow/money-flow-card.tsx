"use client";

import { Network, Store, Tag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MoneyFlowResult } from "@/app/actions/analysis/get-money-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SankeySvg, type SankeyHoverTarget } from "./sankey-svg";
import { SankeyTableFallback } from "./sankey-table-fallback";
import { SankeyTooltip } from "./sankey-tooltip";

interface MoneyFlowCardProps {
  data: MoneyFlowResult;
}

const MIN_HEIGHT = 320;
const HEIGHT_RATIO = 0.55;

export function MoneyFlowCard({ data }: MoneyFlowCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<SankeyHoverTarget>(null);
  const [view, setView] = useState<"store" | "tag">("store");

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && Math.abs(w - width) > 1) setWidth(Math.round(w));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [width]);

  const activeView = view === "store" ? data.storeView : data.tagView;
  const isEmpty = activeView.nodes.length === 0;

  const nodeValues = useMemo(() => {
    const map = new Map<string, number>();
    for (const link of activeView.links) {
      map.set(link.source, (map.get(link.source) ?? 0) + link.value);
      map.set(link.target, (map.get(link.target) ?? 0) + link.value);
    }
    return map;
  }, [activeView]);

  const nodeLabels = useMemo(
    () => new Map(activeView.nodes.map((n) => [n.id, n.label])),
    [activeView],
  );

  const height = Math.max(
    MIN_HEIGHT,
    Math.round(width * HEIGHT_RATIO),
  );

  const rootLabel = data.rootKind === "budget" ? "予算" : "支出合計";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Network className="h-5 w-5 text-primary" />
          マネーフロー
          <span className="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
            {rootLabel}: ¥{data.rootAmount.toLocaleString("ja-JP")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "store" | "tag")}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="store" className="gap-1.5">
              <Store className="h-4 w-4" />
              店舗別
            </TabsTrigger>
            <TabsTrigger value="tag" className="gap-1.5">
              <Tag className="h-4 w-4" />
              タグ別
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div
          ref={containerRef}
          className="relative w-full mt-4"
          style={{ minHeight: height }}
        >
          {isEmpty ? (
            <EmptyState rootKind={data.rootKind} />
          ) : (
            <SankeySvg
              nodes={activeView.nodes}
              links={activeView.links}
              width={width}
              height={height}
              ariaLabel={`${rootLabel}から${view === "store" ? "店舗" : "タグ"}までの資金フロー`}
              onHover={setHover}
            />
          )}
          <SankeyTooltip
            target={hover}
            total={data.totalExpense}
            nodeValues={nodeValues}
            nodeLabels={nodeLabels}
          />
        </div>

        {!isEmpty && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            ※ 複数タグの取引は均等按分しています。
          </p>
        )}

        <SankeyTableFallback
          nodes={activeView.nodes}
          links={activeView.links}
        />
      </CardContent>
    </Card>
  );
}

function EmptyState({ rootKind }: { rootKind: "budget" | "expense" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[280px] text-center">
      <p className="text-sm text-muted-foreground">
        {rootKind === "budget"
          ? "今月の支出データがまだありません"
          : "予算と支出を記録するとフローが表示されます"}
      </p>
    </div>
  );
}
