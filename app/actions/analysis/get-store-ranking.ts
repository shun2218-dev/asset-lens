"use server";

import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getStoreRanking(month?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  const currentMonth = month || format(new Date(), "yyyy-MM");

  try {
    const allTransactions = await db
      .select({
        storeName: transaction.storeName,
        amount: transaction.amount,
        date: transaction.date,
        isExpense: transaction.isExpense,
      })
      .from(transaction)
      .where(eq(transaction.userId, session.user.id))
      .orderBy(desc(transaction.date));

    // Filter to current month + expenses only + has store name
    const monthlyExpenses = allTransactions.filter(
      (t) =>
        format(t.date, "yyyy-MM") === currentMonth &&
        t.isExpense &&
        t.storeName,
    );

    // Aggregate by store name
    const storeMap = new Map<string, number>();
    for (const t of monthlyExpenses) {
      const current = storeMap.get(t.storeName!) || 0;
      storeMap.set(t.storeName!, current + t.amount);
    }

    // Sort by total amount descending, take top 5
    return Array.from(storeMap.entries())
      .map(([storeName, totalAmount]) => ({ storeName, totalAmount }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  } catch (error) {
    console.error("Failed to get store ranking:", error);
    return [];
  }
}
