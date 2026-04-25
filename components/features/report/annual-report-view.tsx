"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AnnualReportData } from "@/app/actions/analysis/get-annual-report";
import { getAnnualReport } from "@/app/actions/analysis/get-annual-report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  comparison,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  comparison?: { prev: number; label: string } | null;
}) {
  const diff = comparison ? value - comparison.prev : null;
  const diffPercent =
    comparison && comparison.prev > 0
      ? Math.round(((value - comparison.prev) / comparison.prev) * 100)
      : null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>
              ¥{value.toLocaleString()}
            </p>
          </div>
          <div className={`p-3 rounded-full bg-muted/50 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {diff !== null && diffPercent !== null && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            {diff >= 0 ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span>
              前年比 {diffPercent >= 0 ? "+" : ""}
              {diffPercent}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MonthlyTable({
  data,
}: {
  data: AnnualReportData["monthlyBreakdown"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📋 月別収支</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">月</th>
              <th className="text-right py-2 font-medium">収入</th>
              <th className="text-right py-2 font-medium">支出</th>
              <th className="text-right py-2 font-medium">収支</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.month} className="border-b last:border-0">
                <td className="py-2 font-medium">
                  {row.month.split("-")[1]}月
                </td>
                <td className="py-2 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                  ¥{row.income.toLocaleString()}
                </td>
                <td className="py-2 text-right tabular-nums text-red-700 dark:text-red-400">
                  ¥{row.expense.toLocaleString()}
                </td>
                <td
                  className={`py-2 text-right tabular-nums font-medium ${row.balance >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}
                >
                  {row.balance >= 0 ? "+" : ""}¥{row.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CategoryRanking({
  data,
  totalExpense,
}: {
  data: AnnualReportData["categoryStats"];
  totalExpense: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🏷️ カテゴリ別支出</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.slice(0, 10).map((cat) => {
          const percentage =
            totalExpense > 0 ? Math.round((cat.total / totalExpense) * 100) : 0;
          return (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{cat.category}</span>
                <span className="text-muted-foreground tabular-nums">
                  ¥{cat.total.toLocaleString()} ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all animate-progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            データがありません
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function AnnualReportView() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<AnnualReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async (y: number) => {
    setLoading(true);
    const result = await getAnnualReport(y);
    if (result.success) {
      setReport(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReport(year);
  }, [year, fetchReport]);

  return (
    <div className="space-y-6">
      {/* Year navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 年次レポート</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear((y) => y - 1)}
            aria-label="前の年"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold tabular-nums min-w-[5ch] text-center">
            {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= new Date().getFullYear()}
            aria-label="次の年"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : report ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              title="年間収入"
              value={report.totalIncome}
              icon={TrendingUp}
              color="text-emerald-700 dark:text-emerald-400"
              comparison={
                report.previousYear
                  ? {
                      prev: report.previousYear.totalIncome,
                      label: "前年",
                    }
                  : null
              }
            />
            <SummaryCard
              title="年間支出"
              value={report.totalExpense}
              icon={TrendingDown}
              color="text-red-700 dark:text-red-400"
              comparison={
                report.previousYear
                  ? {
                      prev: report.previousYear.totalExpense,
                      label: "前年",
                    }
                  : null
              }
            />
            <SummaryCard
              title="年間収支"
              value={report.balance}
              icon={report.balance >= 0 ? PiggyBank : Wallet}
              color={
                report.balance >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-700 dark:text-red-400"
              }
              comparison={
                report.previousYear
                  ? { prev: report.previousYear.balance, label: "前年" }
                  : null
              }
            />
          </div>

          {/* Savings rate */}
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                <span className="font-medium">貯蓄率</span>
              </div>
              <span
                className={`text-xl font-bold tabular-nums ${report.savingsRate >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}
              >
                {report.savingsRate}%
              </span>
            </CardContent>
          </Card>

          {/* Monthly breakdown + Category ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyTable data={report.monthlyBreakdown} />
            <CategoryRanking
              data={report.categoryStats}
              totalExpense={report.totalExpense}
            />
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            レポートデータの取得に失敗しました
          </CardContent>
        </Card>
      )}
    </div>
  );
}
