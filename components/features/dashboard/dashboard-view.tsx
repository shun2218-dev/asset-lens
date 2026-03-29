"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { CategoryPie } from "@/components/features/dashboard/charts/category-pie";
import { MonthlyChart } from "@/components/features/dashboard/charts/monthly-chart";
import { MonthSelector } from "@/components/features/dashboard/month-selector";
import { BudgetProgress } from "@/components/features/dashboard/widgets/budget-progress";
import { RecentTransactions } from "@/components/features/dashboard/widgets/recent-transactions";
import { StoreRanking } from "@/components/features/dashboard/widgets/store-ranking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  SelectBudget,
  SelectCategory,
  SelectTransaction,
} from "@/db/schema";
import type { CategoryStats, MonthlyStats, SummaryStats } from "@/types";

interface StoreRankingItem {
  storeName: string;
  totalAmount: number;
}

interface BudgetWithCategory extends SelectBudget {
  category: SelectCategory | null;
}

interface DashboardViewProps {
  summary: SummaryStats;
  previousSummary: SummaryStats;
  monthlyStats: MonthlyStats[];
  categoryStats: CategoryStats[];
  currentMonth: string;
  recentTransactions: SelectTransaction[];
  storeRanking: StoreRankingItem[];
  categories: SelectCategory[];
  budgets: BudgetWithCategory[];
  categoryExpenses: { categoryId: string; amount: number }[];
}

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
  summary,
  previousSummary = { totalIncome: 0, totalExpense: 0, balance: 0 },
  monthlyStats,
  categoryStats,
  currentMonth,
  recentTransactions,
  storeRanking,
  categories,
  budgets,
  categoryExpenses,
}: DashboardViewProps) {
  // グラフ用にデータを変換
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
    <main className="container mx-auto p-4 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <MonthSelector currentMonth={currentMonth} />
      </div>

      {/* サマリーカード (MoM比較付き) */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="animate-fade-in-up stagger-1">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-sm text-muted-foreground">収入</p>
            <p className="text-xl font-bold text-blue-600">
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
            <p className="text-xl font-bold text-red-600">
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
              className={`text-xl font-bold ${summary.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}
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

      {/* チャートエリア */}
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

      {/* 予算進捗 */}
      <BudgetProgress
        budgets={budgets}
        totalExpense={summary.totalExpense}
        categoryExpenses={categoryExpenses}
      />

      {/* ウィジェットエリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StoreRanking data={storeRanking} />
        <RecentTransactions
          transactions={recentTransactions}
          currentMonth={currentMonth}
        />
      </div>
    </main>
  );
}
