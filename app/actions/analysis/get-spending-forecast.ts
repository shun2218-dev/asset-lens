"use server";

import {
  endOfMonth,
  format,
  getDaysInMonth,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export type ForecastResult = {
  currentMonth: string;
  daysElapsed: number;
  daysInMonth: number;
  currentSpend: number;
  projectedSpend: number;
  dailyRate: number;
  historicalAverage: number;
  budgetAmount: number | null;
  status: "on_track" | "warning" | "over_budget" | "insufficient_data";
};

const MIN_DAYS_FOR_FORECAST = 7;

export const getSpendingForecast = createSafeAction<string, ForecastResult>(
  async (month, userId) => {
    const currentMonth = month || format(new Date(), "yyyy-MM");
    const monthDate = parse(currentMonth, "yyyy-MM", new Date());
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const today = new Date();
    const daysInMonth = getDaysInMonth(monthDate);

    // If viewing past month, all days have elapsed
    const isCurrentMonth = format(today, "yyyy-MM") === currentMonth;
    const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;

    // Get current month expense total
    const [currentResult] = await db
      .select({
        total: sql<number>`coalesce(sum(${transaction.amount}), 0)`,
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.isExpense, true),
          gte(transaction.date, monthStart),
          lte(transaction.date, monthEnd),
        ),
      );

    const currentSpend = Number(currentResult.total);

    // Get past 3 months totals for historical average
    const historicalMonths: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const prevMonth = subMonths(monthDate, i);
      const [result] = await db
        .select({
          total: sql<number>`coalesce(sum(${transaction.amount}), 0)`,
        })
        .from(transaction)
        .where(
          and(
            eq(transaction.userId, userId),
            eq(transaction.isExpense, true),
            gte(transaction.date, startOfMonth(prevMonth)),
            lte(transaction.date, endOfMonth(prevMonth)),
          ),
        );
      historicalMonths.push(Number(result.total));
    }

    const nonZeroMonths = historicalMonths.filter((m) => m > 0);
    const historicalAverage =
      nonZeroMonths.length > 0
        ? Math.round(
            nonZeroMonths.reduce((a, b) => a + b, 0) / nonZeroMonths.length,
          )
        : 0;

    // Get overall budget if set
    const budgetModule = await import("@/app/actions/budget/get");
    const budgets = await budgetModule.getBudgets();
    const overallBudget = budgets.find((b) => !b.categoryId);
    const budgetAmount = overallBudget?.amount ?? null;

    // Calculate forecast
    if (daysElapsed < MIN_DAYS_FOR_FORECAST && isCurrentMonth) {
      return {
        currentMonth,
        daysElapsed,
        daysInMonth,
        currentSpend,
        projectedSpend: historicalAverage || 0,
        dailyRate: daysElapsed > 0 ? Math.round(currentSpend / daysElapsed) : 0,
        historicalAverage,
        budgetAmount,
        status: "insufficient_data" as const,
      };
    }

    const dailyRate =
      daysElapsed > 0 ? Math.round(currentSpend / daysElapsed) : 0;
    const projectedSpend = isCurrentMonth
      ? Math.round(dailyRate * daysInMonth)
      : currentSpend;

    // Determine status
    let status: ForecastResult["status"] = "on_track";
    if (budgetAmount) {
      const projectedPercentage = (projectedSpend / budgetAmount) * 100;
      if (projectedPercentage >= 100) {
        status = "over_budget";
      } else if (projectedPercentage >= 80) {
        status = "warning";
      }
    } else if (historicalAverage > 0) {
      const vsHistorical = (projectedSpend / historicalAverage) * 100;
      if (vsHistorical >= 120) {
        status = "over_budget";
      } else if (vsHistorical >= 100) {
        status = "warning";
      }
    }

    return {
      currentMonth,
      daysElapsed,
      daysInMonth,
      currentSpend,
      projectedSpend,
      dailyRate,
      historicalAverage,
      budgetAmount,
      status,
    };
  },
  { errorMessage: "Failed to fetch spending forecast", rateLimit: "read" },
);
