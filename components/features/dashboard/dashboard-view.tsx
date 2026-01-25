"use client";

import { CategoryPie } from "@/components/features/dashboard/charts/category-pie";
import { MonthlyChart } from "@/components/features/dashboard/charts/monthly-chart";
import { MonthSelector } from "@/components/features/dashboard/month-selector";
import { TransactionForm } from "@/components/features/transaction/transaction-form";
import { TransactionList } from "@/components/features/transaction/transaction-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SelectCategory, SelectTransaction } from "@/db/schema";
import type { CategoryStats, MonthlyStats, SummaryStats, TransactionMetadata } from "@/types";

interface DashboardViewProps {
  summary: SummaryStats;
  monthlyStats: MonthlyStats[];
  categoryStats: CategoryStats[];
  currentMonth: string;
  transactions: SelectTransaction[];
  metadata: TransactionMetadata;
  categories: SelectCategory[];
}

export function DashboardView({
  summary,
  monthlyStats,
  categoryStats,
  currentMonth,
  transactions,
  metadata,
  categories,
}: DashboardViewProps) {
  // グラフ用にデータを変換 (Adapter Pattern)
  // MonthlyChart: { month, income, expense } -> { name, income, expense }
  const barData = monthlyStats.map((stat) => ({
    name: stat.month, // "2024-01" などを name に入れる
    income: stat.income,
    expense: stat.expense,
  }));

  // CategoryPie: { category, amount } -> { name, value }
  const rawPieData = categoryStats.map((stat) => {
    const categoryName =
      categories.find((c) => c.id === stat.category || c.slug === stat.category)
        ?.name ??
      stat.category ??
      "不明";
    return {
      name: categoryName,
      value: stat.amount,
    };
  });

  // 名前で集約して重複を排除
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
    <main className="container mx-auto p-4 max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AssetLens</h1>
        <MonthSelector currentMonth={currentMonth} />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">収入</p>
          <p className="font-bold text-blue-600">
            +{summary.totalIncome.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">支出</p>
          <p className="font-bold text-red-600">
            -{summary.totalExpense.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">収支</p>
          <p className="font-bold">¥{summary.balance.toLocaleString()}</p>
        </div>
      </div>

      {/* ダッシュボードエリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月次収支推移</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={barData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今月の支出内訳</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={pieData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左側: 入力フォーム (1カラム) */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>新規入力</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm categories={categories} />
            </CardContent>
          </Card>
        </div>

        {/* 右側: 履歴リスト (2カラム) */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>直近の履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList
                initialData={transactions}
                initialMetadata={metadata}
                currentMonth={currentMonth}
                categories={categories}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
