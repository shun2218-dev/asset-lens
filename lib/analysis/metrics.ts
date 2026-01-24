// lib/analysis/metrics.ts
import { format } from "date-fns";
import type { transaction } from "@/db/schema";

type Transaction = typeof transaction.$inferSelect;

// 1. 期間内の合計集計 (収入、支出、残高)
export function calculatePeriodSummary(data: Transaction[]) {
  const totalIncome = data
    .filter((t) => !t.isExpense)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = data
    .filter((t) => t.isExpense)
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

// 2. カテゴリ別集計 (円グラフ用)
export function calculateCategoryBreakdown(data: Transaction[]) {
  const stats = new Map<string, number>();

  // 支出のみを集計
  data
    .filter((t) => t.isExpense)
    .forEach((t) => {
      // categoryIdがあればそれを使う、なければcategory (slug/legacy) を使う
      const key = t.categoryId || t.category;
      const current = stats.get(key) || 0;
      stats.set(key, current + t.amount);
    });

  return Array.from(stats.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

// 3. 月別推移 (棒グラフ用)
export function calculateMonthlyTrends(data: Transaction[]) {
  const stats = new Map<string, { income: number; expense: number }>();

  data.forEach((t) => {
    const monthKey = format(t.date, "yyyy-MM");
    const current = stats.get(monthKey) || { income: 0, expense: 0 };

    if (t.isExpense) current.expense += t.amount;
    else current.income += t.amount;

    stats.set(monthKey, current);
  });

  return Array.from(stats.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
