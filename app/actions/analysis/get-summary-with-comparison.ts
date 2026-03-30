"use server";

import { format, subMonths } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import {
  calculateCategoryBreakdown,
  calculateMonthlyTrends,
  calculatePeriodSummary,
} from "@/lib/analysis/metrics";
import { auth } from "@/lib/auth";
import type { CategoryStats, MonthlyStats, SummaryStats } from "@/types";

export type DashboardSummaryResult = {
  currentMonth: string;
  summary: SummaryStats;
  previousSummary: SummaryStats;
  categoryStats: CategoryStats[];
  monthlyStats: MonthlyStats[];
  categoryExpenses: { categoryId: string; amount: number }[];
};

const EMPTY_SUMMARY: SummaryStats = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
};

/**
 * Fetch dashboard summary data for both current and previous month
 * in a single database query, eliminating the duplicate getSummary calls.
 *
 * Also computes categoryExpenses server-side to avoid client-side
 * category ID resolution.
 */
export async function getSummaryWithComparison(
  month?: string,
): Promise<DashboardSummaryResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const currentMonth = month || format(new Date(), "yyyy-MM");
  const [year, mon] = currentMonth.split("-").map(Number);
  const prevDate = subMonths(new Date(year, mon - 1, 1), 1);
  const previousMonth = format(prevDate, "yyyy-MM");

  const emptyResult: DashboardSummaryResult = {
    currentMonth,
    summary: EMPTY_SUMMARY,
    previousSummary: EMPTY_SUMMARY,
    categoryStats: [],
    monthlyStats: [],
    categoryExpenses: [],
  };

  if (!session) {
    return emptyResult;
  }

  try {
    // Single DB query — filter both months in JS (same as original)
    const allTransactions = await db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, session.user.id))
      .orderBy(desc(transaction.date));

    // Current month data
    const currentTransactions = allTransactions.filter(
      (t) => format(t.date, "yyyy-MM") === currentMonth,
    );

    // Previous month data — reuse same query result
    const prevTransactions = allTransactions.filter(
      (t) => format(t.date, "yyyy-MM") === previousMonth,
    );

    const summary = calculatePeriodSummary(currentTransactions);
    const previousSummary = calculatePeriodSummary(prevTransactions);
    const categoryStats = calculateCategoryBreakdown(currentTransactions);
    const monthlyStats = calculateMonthlyTrends(allTransactions);

    // Build categoryExpenses server-side using categoryId from transactions
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
    };
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    return emptyResult;
  }
}
