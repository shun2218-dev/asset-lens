import { endOfMonth, format, isWithinInterval, startOfMonth } from "date-fns";
import type { transaction } from "@/db/schema";

type Transaction = typeof transaction.$inferSelect;

// 月ごとの収支推移（棒グラフ用）
export function getMonthlyStats(data: Transaction[]) {
  const stats = new Map<
    string,
    { name: string; income: number; expense: number }
  >();

  // 日付順（古い順）にソート
  const sortedData = [...data].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  for (const t of sortedData) {
    const monthKey = format(t.date, "yyyy/MM");

    if (!stats.has(monthKey)) {
      stats.set(monthKey, { name: monthKey, income: 0, expense: 0 });
    }

    let entry = stats.get(monthKey);

    // 存在しなければ作成してMapにセットする
    if (!entry) {
      entry = { name: monthKey, income: 0, expense: 0 };
      stats.set(monthKey, entry);
    }

    if (t.isExpense) {
      entry.expense += t.amount;
    } else {
      entry.income += t.amount;
    }
  }

  return Array.from(stats.values());
}

// 今月のカテゴリ別支出（円グラフ用）
export function getCurrentMonthCategoryStats(data: Transaction[]) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const currentMonthData = data.filter(
    (t) => t.isExpense && isWithinInterval(t.date, { start, end }),
  );

  const stats = new Map<string, number>();

  for (const t of currentMonthData) {
    const current = stats.get(t.category) ?? 0;
    stats.set(t.category, current + t.amount);
  }

  return Array.from(stats.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // 金額が大きい順
}
