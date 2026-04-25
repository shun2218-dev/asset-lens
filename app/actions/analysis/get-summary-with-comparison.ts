"use server";

import { format, subMonths } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import {
  calculateCategoryBreakdown,
  calculateMonthlyTrends,
  calculatePeriodSummary,
} from "@/lib/analysis/metrics";
import type { CategoryStats, MonthlyStats, SummaryStats } from "@/types";

export type DashboardSummaryResult = {
  currentMonth: string;
  summary: SummaryStats;
  previousSummary: SummaryStats;
  categoryStats: CategoryStats[];
  monthlyStats: MonthlyStats[];
  categoryExpenses: { categoryId: string; amount: number }[];
  isFallback: boolean;
  requestedMonth: string;
};

const EMPTY_SUMMARY: SummaryStats = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
};

/**
 * Find the most recent month (yyyy-MM) that has at least one transaction.
 * Returns null if the user has no transactions at all.
 */
function findLatestMonthWithData(
  allTransactions: { date: Date }[],
): string | null {
  if (allTransactions.length === 0) return null;
  return format(allTransactions[0].date, "yyyy-MM");
}

export const getSummaryWithComparison = createSafeAction<
  string | undefined,
  DashboardSummaryResult
>(
  async (month, userId) => {
    const requestedMonth = month || format(new Date(), "yyyy-MM");

    const allTransactions = await db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.date));

    const requestedTransactions = allTransactions.filter(
      (t) => format(t.date, "yyyy-MM") === requestedMonth,
    );

    let currentMonth = requestedMonth;
    let isFallback = false;

    if (requestedTransactions.length === 0 && !month) {
      const latestMonth = findLatestMonthWithData(allTransactions);
      if (latestMonth) {
        currentMonth = latestMonth;
        isFallback = true;
      }
    }

    const currentTransactions = isFallback
      ? allTransactions.filter(
          (t) => format(t.date, "yyyy-MM") === currentMonth,
        )
      : requestedTransactions;

    const [year, mon] = currentMonth.split("-").map(Number);
    const prevDate = subMonths(new Date(year, mon - 1, 1), 1);
    const previousMonth = format(prevDate, "yyyy-MM");

    const prevTransactions = allTransactions.filter(
      (t) => format(t.date, "yyyy-MM") === previousMonth,
    );

    const summary = calculatePeriodSummary(currentTransactions);
    const previousSummary = calculatePeriodSummary(prevTransactions);
    const categoryStats = calculateCategoryBreakdown(currentTransactions);
    const monthlyStats = calculateMonthlyTrends(allTransactions);

    const expenseMap = new Map<string, number>();
    for (const t of currentTransactions) {
      if (t.isExpense && t.categoryId) {
        const current = expenseMap.get(t.categoryId) || 0;
        expenseMap.set(t.categoryId, current + t.amount);
      }
    }
    const categoryExpenses = Array.from(expenseMap.entries()).map(
      ([categoryId, amount]) => ({
        categoryId,
        amount,
      }),
    );

    return {
      currentMonth,
      summary,
      previousSummary,
      categoryStats,
      monthlyStats,
      categoryExpenses,
      isFallback,
      requestedMonth,
    };
  },
  { errorMessage: "Failed to fetch dashboard summary" },
);
