"use server";

import { format, subMonths } from "date-fns";
import { desc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export type CategoryTrendItem = {
  categoryId: string;
  categoryName: string;
  /** Monthly totals for the last 6 months, ordered chronologically */
  months: { month: string; amount: number }[];
  /** Current month total */
  currentAmount: number;
  /** Previous month total */
  previousAmount: number;
  /** Change percentage vs previous month */
  changePercent: number | null;
};

export const getCategoryTrends = createSafeAction<
  string | undefined,
  CategoryTrendItem[]
>(
  async (currentMonthInput, userId) => {
    const now = new Date();
    const currentMonth = currentMonthInput || format(now, "yyyy-MM");

    // Build list of last 6 months
    const [year, mon] = currentMonth.split("-").map(Number);
    const baseDate = new Date(year, mon - 1, 1);
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      months.push(format(subMonths(baseDate, i), "yyyy-MM"));
    }

    // Fetch all transactions and categories
    const [allTransactions, categories] = await Promise.all([
      db
        .select()
        .from(transaction)
        .where(eq(transaction.userId, userId))
        .orderBy(desc(transaction.date)),
      db
        .select()
        .from(category)
        .where(or(isNull(category.userId), eq(category.userId, userId))),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    // Build: categoryId -> month -> amount
    const trendMap = new Map<string, Map<string, number>>();

    for (const t of allTransactions) {
      if (!t.isExpense || !t.categoryId) continue;
      const tMonth = format(t.date, "yyyy-MM");
      if (!months.includes(tMonth)) continue;

      if (!trendMap.has(t.categoryId)) {
        trendMap.set(t.categoryId, new Map());
      }
      const monthMap = trendMap.get(t.categoryId);
      if (!monthMap) continue;
      monthMap.set(tMonth, (monthMap.get(tMonth) || 0) + t.amount);
    }

    const currentMonthKey = months[months.length - 1];
    const previousMonthKey = months[months.length - 2];

    const results: CategoryTrendItem[] = [];
    for (const [catId, monthMap] of trendMap) {
      const currentAmount = monthMap.get(currentMonthKey) || 0;
      const previousAmount = monthMap.get(previousMonthKey) || 0;

      // Only include categories with at least 2 months of data
      const monthsWithData = months.filter((m) => (monthMap.get(m) || 0) > 0);
      if (monthsWithData.length < 2) continue;

      const changePercent =
        previousAmount > 0
          ? ((currentAmount - previousAmount) / previousAmount) * 100
          : null;

      results.push({
        categoryId: catId,
        categoryName: categoryMap.get(catId) || "不明",
        months: months.map((m) => ({
          month: m,
          amount: monthMap.get(m) || 0,
        })),
        currentAmount,
        previousAmount,
        changePercent,
      });
    }

    // Sort by current month amount descending
    results.sort((a, b) => b.currentAmount - a.currentAmount);

    return results;
  },
  { errorMessage: "Failed to fetch category trends" },
);
