"use server";

import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export type DailyExpense = {
  date: string; // "yyyy-MM-dd"
  amount: number;
};

export const getDailyExpenses = createSafeAction<
  string | undefined,
  DailyExpense[]
>(
  async (monthInput, userId) => {
    const currentMonth = monthInput || format(new Date(), "yyyy-MM");

    const allTransactions = await db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, userId));

    // Filter to the target month and aggregate by day
    const dailyMap = new Map<string, number>();

    for (const t of allTransactions) {
      if (!t.isExpense) continue;
      const dateStr = format(t.date, "yyyy-MM-dd");
      if (!dateStr.startsWith(currentMonth)) continue;
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + t.amount);
    }

    return Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
  { errorMessage: "Failed to fetch daily expenses" },
);
