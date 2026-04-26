"use server";

import { format } from "date-fns";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export type MonthlyBreakdown = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

export type CategoryAnnualStat = {
  categoryId: string;
  total: number;
  monthlyAmounts: { month: string; amount: number }[];
};

export type AnnualReportData = {
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  monthlyBreakdown: MonthlyBreakdown[];
  categoryStats: CategoryAnnualStat[];
  previousYear: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  } | null;
};

export const getAnnualReport = createSafeAction<
  number | undefined,
  AnnualReportData
>(
  async (yearInput, userId) => {
    const year = yearInput ?? new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Fetch all transactions for the year
    const yearTransactions = await db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          gte(transaction.date, startDate),
          lte(transaction.date, endDate),
        ),
      );

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    for (const t of yearTransactions) {
      if (t.isExpense) {
        totalExpense += t.amount;
      } else {
        totalIncome += t.amount;
      }
    }
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Monthly breakdown
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    for (let m = 0; m < 12; m++) {
      const key = format(new Date(year, m, 1), "yyyy-MM");
      monthlyMap.set(key, { income: 0, expense: 0 });
    }

    for (const t of yearTransactions) {
      const key = format(t.date, "yyyy-MM");
      const entry = monthlyMap.get(key);
      if (entry) {
        if (t.isExpense) {
          entry.expense += t.amount;
        } else {
          entry.income += t.amount;
        }
      }
    }

    const monthlyBreakdown: MonthlyBreakdown[] = Array.from(
      monthlyMap.entries(),
    ).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }));

    // Category stats (expenses only)
    const categoryMap = new Map<
      string,
      { total: number; monthly: Map<string, number> }
    >();

    for (const t of yearTransactions) {
      if (!t.isExpense) continue;
      const cat = t.categoryId;
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { total: 0, monthly: new Map() });
      }
      const entry = categoryMap.get(cat)!;
      entry.total += t.amount;
      const monthKey = format(t.date, "yyyy-MM");
      entry.monthly.set(
        monthKey,
        (entry.monthly.get(monthKey) ?? 0) + t.amount,
      );
    }

    const categoryStats: CategoryAnnualStat[] = Array.from(
      categoryMap.entries(),
    )
      .map(([categoryId, data]) => ({
        categoryId,
        total: data.total,
        monthlyAmounts: Array.from(monthlyMap.keys()).map((month) => ({
          month,
          amount: data.monthly.get(month) ?? 0,
        })),
      }))
      .sort((a, b) => b.total - a.total);

    // Previous year comparison
    const prevStartDate = new Date(year - 1, 0, 1);
    const prevEndDate = new Date(year - 1, 11, 31);

    const [prevResult] = await db
      .select({
        income: sql<number>`coalesce(sum(case when ${transaction.isExpense} = false then ${transaction.amount} else 0 end), 0)`,
        expense: sql<number>`coalesce(sum(case when ${transaction.isExpense} = true then ${transaction.amount} else 0 end), 0)`,
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          gte(transaction.date, prevStartDate),
          lte(transaction.date, prevEndDate),
        ),
      );

    const prevIncome = Number(prevResult.income);
    const prevExpense = Number(prevResult.expense);
    const previousYear =
      prevIncome > 0 || prevExpense > 0
        ? {
            totalIncome: prevIncome,
            totalExpense: prevExpense,
            balance: prevIncome - prevExpense,
          }
        : null;

    return {
      year,
      totalIncome,
      totalExpense,
      balance,
      savingsRate: Math.round(savingsRate * 10) / 10,
      monthlyBreakdown,
      categoryStats,
      previousYear,
    };
  },
  { errorMessage: "Failed to fetch annual report", rateLimit: "read" },
);
