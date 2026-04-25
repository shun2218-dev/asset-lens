"use server";

import { addMonths, parse } from "date-fns";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export type DailySummary = {
  date: string; // "yyyy-MM-dd"
  income: number;
  expense: number;
  count: number;
};

export const getMonthlyDailySummary = createSafeAction<
  string, // month: "yyyy-MM"
  DailySummary[]
>(
  async (month, userId) => {
    const startDate = parse(month, "yyyy-MM", new Date());
    const endDate = addMonths(startDate, 1);

    const rows = await db
      .select({
        date: sql<string>`to_char(${transaction.date}, 'YYYY-MM-DD')`,
        income: sql<number>`COALESCE(SUM(CASE WHEN ${transaction.isExpense} = false THEN ${transaction.amount} ELSE 0 END), 0)`,
        expense: sql<number>`COALESCE(SUM(CASE WHEN ${transaction.isExpense} = true THEN ${transaction.amount} ELSE 0 END), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          gte(transaction.date, startDate),
          lt(transaction.date, endDate),
        ),
      )
      .groupBy(sql`to_char(${transaction.date}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${transaction.date}, 'YYYY-MM-DD')`);

    return rows;
  },
  { errorMessage: "Failed to fetch daily summary" },
);
