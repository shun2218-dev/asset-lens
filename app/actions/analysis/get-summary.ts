"use server";

import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import {
  calculateCategoryBreakdown,
  calculateMonthlyTrends,
  calculatePeriodSummary,
} from "@/lib/analysis/metrics";

export type SummaryResult = {
  currentMonth: string;
  summary: { totalIncome: number; totalExpense: number; balance: number };
  categoryStats: ReturnType<typeof calculateCategoryBreakdown>;
  monthlyStats: ReturnType<typeof calculateMonthlyTrends>;
};

export const getSummary = createSafeAction<string | undefined, SummaryResult>(
  async (month, userId) => {
    const currentMonth = month || format(new Date(), "yyyy-MM");

    const allTransactions = await db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.date));

    const monthlyTransactions = allTransactions.filter((t) => {
      return format(t.date, "yyyy-MM") === currentMonth;
    });

    const summary = calculatePeriodSummary(monthlyTransactions);
    const categoryStats = calculateCategoryBreakdown(monthlyTransactions);
    const monthlyStats = calculateMonthlyTrends(allTransactions);

    return {
      currentMonth,
      summary,
      categoryStats,
      monthlyStats,
    };
  },
  { errorMessage: "Failed to fetch summary" },
);
