"use server";

import { and, eq, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction, createSafeQuery } from "@/lib/actions/safe-action";

/**
 * Get transactions without a store name assigned
 */
export const getTransactionsWithoutStore = createSafeQuery(
  async (userId) => {
    const rows = await db
      .select({
        id: transaction.id,
        description: transaction.description,
        storeName: transaction.storeName,
        date: transaction.date,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          or(isNull(transaction.storeName), eq(transaction.storeName, "")),
        ),
      )
      .orderBy(transaction.date);

    return rows;
  },
  { errorMessage: "Failed to get transactions without store" },
);

interface StoreNameUpdate {
  id: string;
  storeName: string;
  description: string;
}

/**
 * Batch update store names for transactions
 */
export const applyStoreNameMigration = createSafeAction<
  StoreNameUpdate[],
  { updatedCount: number }
>(
  async (updates, userId) => {
    let updatedCount = 0;

    for (const update of updates) {
      // Only update user's own data (security)
      await db
        .update(transaction)
        .set({
          storeName: update.storeName || null,
          description: update.description,
        })
        .where(
          and(eq(transaction.id, update.id), eq(transaction.userId, userId)),
        );
      updatedCount++;
    }

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
    revalidatePath("/settings");

    return { updatedCount };
  },
  { errorMessage: "Failed to apply store name migration" },
);
