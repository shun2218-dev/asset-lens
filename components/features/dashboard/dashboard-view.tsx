"use client";

import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { MonthSelector } from "@/components/features/dashboard/month-selector";
import { BudgetProgress } from "@/components/features/dashboard/widgets/budget-progress";
import { RecentTransactions } from "@/components/features/dashboard/widgets/recent-transactions";
import { StoreRanking } from "@/components/features/dashboard/widgets/store-ranking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  SelectBudget,
  SelectCategory,
  SelectTransaction,
} from "@/db/schema";
import type { CategoryStats, MonthlyStats, SummaryStats } from "@/types";

/** Lazy-loaded chart components (recharts is ~200KB) */
const MonthlyChart = dynamic(
  () =>
    import("@/components/features/dashboard/charts/monthly-chart").then(
      (mod) => mod.MonthlyChart,
    ),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-lg" /> },
);

const CategoryPie = dynamic(
  () =>
    import("@/components/features/dashboard/charts/category-pie").then(
      (mod) => mod.CategoryPie,
    ),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-lg" /> },
);

type StoreRankingItem = {
  storeName: string;
  totalAmount: number;
};

type BudgetWithCategory = SelectBudget & {
  category: SelectCategory | null;
};

type DashboardOverview = {
  summary: SummaryStats;
  previousSummary: SummaryStats;
  currentMonth: string;
};

type DashboardCharts = {
  monthlyStats: MonthlyStats[];
  categoryStats: CategoryStats[];
  categories: SelectCategory[];
};

type DashboardWidgets = {
  recentTransactions: SelectTransaction[];
  storeRanking: StoreRankingItem[];
  budgets: BudgetWithCategory[];
  categoryExpenses: { categoryId: string; amount: number }[];
};

type DashboardViewProps = {
  overview: DashboardOverview;
  charts: DashboardCharts;
  widgets: DashboardWidgets;
};

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
        isUp ? "text-emerald-600" : "text-red-500"
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

export function DashboardView({
  overview,
  charts,
  widgets,
}: DashboardViewProps) {
  const { summary, previousSummary, currentMonth } = overview;
  const { monthlyStats, categoryStats, categories } = charts;
  const { recentTransactions, storeRanking, budgets, categoryExpenses } =
    widgets;

  const barData = monthlyStats.map((stat) => ({
    name: stat.month,
    income: stat.income,
    expense: stat.expense,
  }));

  const rawPieData = categoryStats.map((stat) => {
    const categoryName =
      categories.find((c) => c.id === stat.category || c.slug === stat.category)
        ?.name ??
      stat.category ??
      "不明";
    return { name: categoryName, value: stat.amount };
  });

  const pieDataMap = new Map<string, number>();
  rawPieData.forEach((item) => {
    const current = pieDataMap.get(item.name) || 0;
    pieDataMap.set(item.name, current + item.value);
  });
  const pieData = Array.from(pieDataMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <main className="container mx-auto p-4 max-w-6xl space-y-6 pb-24 md:pb-6">
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
        <>
          {/* Summary cards with MoM comparison */}
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

          {/* Chart area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="animate-fade-in-up stagger-4">
              <CardHeader>
                <CardTitle>月次収支推移</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyChart data={barData} />
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up stagger-5">
              <CardHeader>
                <CardTitle>今月の支出内訳</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPie data={pieData} />
              </CardContent>
            </Card>
          </div>

          {/* Budget progress */}
          <BudgetProgress
            budgets={budgets}
            totalExpense={summary.totalExpense}
            categoryExpenses={categoryExpenses}
          />

          {/* Widget area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StoreRanking data={storeRanking} />
            <RecentTransactions
              transactions={recentTransactions}
              currentMonth={currentMonth}
            />
          </div>
        </>
      )}
    </main>
  );
}
