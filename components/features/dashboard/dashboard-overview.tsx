"use client";

import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { MonthSelector } from "@/components/features/dashboard/month-selector";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { SummaryStats } from "@/types";

function MoMBadge({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  const isUp = change > 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-emerald-700" : "text-red-600"
      }`}
    >
      {isUp ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {Math.abs(change).toFixed(0)}%
    </span>
  );
}

type DashboardOverviewProps = {
  summary: SummaryStats;
  previousSummary: SummaryStats;
  currentMonth: string;
};

export function DashboardOverview({
  summary,
  previousSummary,
  currentMonth,
}: DashboardOverviewProps) {
  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">ダッシュボード</h1>
        <MonthSelector currentMonth={currentMonth} />
      </div>

      {summary.totalIncome === 0 && summary.totalExpense === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="まずは最初の取引を記録しましょう"
          description="収入や支出を記録すると、ここにグラフやサマリーが表示されます。"
          action={{ label: "＋ 取引を記録する", href: "/transaction" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="animate-fade-in-up stagger-1">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-sm text-muted-foreground">収入</p>
              <p className="text-lg sm:text-xl font-bold text-blue-600">
                +¥{summary.totalIncome.toLocaleString()}
              </p>
              <MoMBadge
                current={summary.totalIncome}
                previous={previousSummary.totalIncome}
              />
            </CardContent>
          </Card>
          <Card className="animate-fade-in-up stagger-2">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-sm text-muted-foreground">支出</p>
              <p className="text-lg sm:text-xl font-bold text-red-600">
                -¥{summary.totalExpense.toLocaleString()}
              </p>
              <MoMBadge
                current={summary.totalExpense}
                previous={previousSummary.totalExpense}
              />
            </CardContent>
          </Card>
          <Card className="animate-fade-in-up stagger-3">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-sm text-muted-foreground">収支</p>
              <p
                className={`text-lg sm:text-xl font-bold ${summary.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                ¥{summary.balance.toLocaleString()}
              </p>
              <MoMBadge
                current={summary.balance}
                previous={previousSummary.balance}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
