"use client";

import Link from "next/link";
import { BudgetRing } from "@/components/features/dashboard/widgets/budget-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SelectBudget, SelectCategory } from "@/db/schema";

interface BudgetWithCategory extends SelectBudget {
  category: SelectCategory | null;
}

interface BudgetProgressProps {
  budgets: BudgetWithCategory[];
  totalExpense: number;
  categoryExpenses: { categoryId: string; amount: number }[];
}

function ProgressBar({
  label,
  spent,
  limit,
}: {
  label: string;
  spent: number;
  limit: number;
}) {
  const percentage = Math.min((spent / limit) * 100, 100);
  const color =
    percentage >= 90
      ? "bg-red-500"
      : percentage >= 70
        ? "bg-yellow-500"
        : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          ¥{spent.toLocaleString()} / ¥{limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all animate-progress-fill`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {percentage >= 100
          ? `¥${(spent - limit).toLocaleString()} オーバー`
          : `残り ¥${(limit - spent).toLocaleString()}`}
      </p>
    </div>
  );
}

export function BudgetProgress({
  budgets,
  totalExpense,
  categoryExpenses,
}: BudgetProgressProps) {
  const overallBudget = budgets.find((b) => !b.categoryId);
  const categoryBudgets = budgets.filter((b) => b.categoryId);

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📊 予算進捗</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-muted-foreground text-center">
            まだ予算が設定されていません
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">設定から予算を追加</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📊 予算進捗</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Budget with Ring */}
        {overallBudget && (
          <div className="flex items-center gap-6">
            <BudgetRing spent={totalExpense} limit={overallBudget.amount} />
            <div className="flex-1">
              <ProgressBar
                label="全体予算"
                spent={totalExpense}
                limit={overallBudget.amount}
              />
            </div>
          </div>
        )}

        {/* Category Budgets */}
        {categoryBudgets.map((b) => {
          const catExpense =
            categoryExpenses.find((e) => e.categoryId === b.categoryId)
              ?.amount ?? 0;
          return (
            <ProgressBar
              key={b.id}
              label={b.category?.name ?? "不明"}
              spent={catExpense}
              limit={b.amount}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
