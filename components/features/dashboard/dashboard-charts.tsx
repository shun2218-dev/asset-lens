"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectCategory } from "@/db/schema";
import type { CategoryStats, MonthlyStats } from "@/types";

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

type DashboardChartsProps = {
  monthlyStats: MonthlyStats[];
  categoryStats: CategoryStats[];
  categories: SelectCategory[];
};

export function DashboardCharts({
  monthlyStats,
  categoryStats,
  categories,
}: DashboardChartsProps) {
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
  );
}
