"use server";

import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export type StoreRankingItem = {
  storeName: string;
  totalAmount: number;
};

export const getStoreRanking = createSafeAction<
  string | undefined,
  StoreRankingItem[]
>(
  async (month, userId) => {
    const currentMonth = month || format(new Date(), "yyyy-MM");

    const allTransactions = await db
      .select({
        storeName: transaction.storeName,
        amount: transaction.amount,
        date: transaction.date,
        isExpense: transaction.isExpense,
      })
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.date));

    const monthlyExpenses = allTransactions.filter(
      (t) =>
        format(t.date, "yyyy-MM") === currentMonth &&
        t.isExpense &&
        t.storeName,
    );

    const storeMap = new Map<string, number>();
    for (const t of monthlyExpenses) {
      const current = storeMap.get(t.storeName!) || 0;
      storeMap.set(t.storeName!, current + t.amount);
    }

    return Array.from(storeMap.entries())
      .map(([storeName, totalAmount]) => ({ storeName, totalAmount }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  },
  { errorMessage: "Failed to get store ranking" },
);
