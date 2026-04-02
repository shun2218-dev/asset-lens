"use server";

import { and, eq, or } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import { dismissedDuplicate, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

/**
 * Simple Levenshtein distance implementation.
 * No external library needed — store names are short strings.
 */
function levenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  const dp: number[][] = Array.from({ length: la + 1 }, (_, i) =>
    Array.from({ length: lb + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[la][lb];
}

export type DuplicateCandidate = {
  transaction1: {
    id: string;
    amount: number;
    description: string | null;
    storeName: string | null;
    category: string;
    date: Date;
  };
  transaction2: {
    id: string;
    amount: number;
    description: string | null;
    storeName: string | null;
    category: string;
    date: Date;
  };
};

/**
 * Detect duplicate transactions for the current user.
 * Criteria: same amount + date within 24h + similar store name (Levenshtein ≤ 2).
 */
export const getDuplicates = createSafeAction<void, DuplicateCandidate[]>(
  async (_input, userId) => {
    // Get all transactions for this user
    const allTransactions = await db
      .select({
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        storeName: transaction.storeName,
        category: transaction.category,
        date: transaction.date,
      })
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(transaction.date);

    // Get dismissed pairs
    const dismissed = await db
      .select({
        id1: dismissedDuplicate.transactionId1,
        id2: dismissedDuplicate.transactionId2,
      })
      .from(dismissedDuplicate)
      .where(eq(dismissedDuplicate.userId, userId));

    const dismissedSet = new Set(dismissed.map((d) => `${d.id1}:${d.id2}`));
    const isDismissed = (id1: string, id2: string) => {
      const [a, b] = [id1, id2].sort();
      return dismissedSet.has(`${a}:${b}`);
    };

    const duplicates: DuplicateCandidate[] = [];

    for (let i = 0; i < allTransactions.length; i++) {
      for (let j = i + 1; j < allTransactions.length; j++) {
        const t1 = allTransactions[i];
        const t2 = allTransactions[j];

        // Same amount
        if (t1.amount !== t2.amount) continue;

        // Within 24 hours
        const timeDiff = Math.abs(t1.date.getTime() - t2.date.getTime());
        if (timeDiff > 24 * 60 * 60 * 1000) continue;

        // Similar store name (Levenshtein ≤ 2)
        const store1 = (t1.storeName || "").toLowerCase();
        const store2 = (t2.storeName || "").toLowerCase();
        // If both have no store, check description instead
        if (!t1.storeName && !t2.storeName) {
          const desc1 = (t1.description || "").toLowerCase();
          const desc2 = (t2.description || "").toLowerCase();
          if (levenshtein(desc1, desc2) > 2) continue;
        } else if (levenshtein(store1, store2) > 2) {
          continue;
        }

        // Check if dismissed
        if (isDismissed(t1.id, t2.id)) continue;

        duplicates.push({ transaction1: t1, transaction2: t2 });
      }
    }

    return duplicates;
  },
  { errorMessage: "Failed to detect duplicates" },
);

/**
 * Merge two duplicate transactions: keep the one with more data, delete the other.
 */
export const mergeDuplicates = createSafeAction<
  { keepId: string; deleteId: string },
  { success: boolean }
>(
  async (input, userId) => {
    const { keepId, deleteId } = input;

    // Verify both transactions belong to this user
    const [keepTx, deleteTx] = await Promise.all([
      db
        .select()
        .from(transaction)
        .where(and(eq(transaction.id, keepId), eq(transaction.userId, userId)))
        .then((r) => r[0]),
      db
        .select()
        .from(transaction)
        .where(
          and(eq(transaction.id, deleteId), eq(transaction.userId, userId)),
        )
        .then((r) => r[0]),
    ]);

    if (!keepTx || !deleteTx) {
      return { success: false, error: "Transaction not found" } as never;
    }

    // Delete the duplicate
    await db
      .delete(transaction)
      .where(and(eq(transaction.id, deleteId), eq(transaction.userId, userId)));

    // Also clean up any dismissed pairs involving the deleted transaction
    await db
      .delete(dismissedDuplicate)
      .where(
        and(
          eq(dismissedDuplicate.userId, userId),
          or(
            eq(dismissedDuplicate.transactionId1, deleteId),
            eq(dismissedDuplicate.transactionId2, deleteId),
          ),
        ),
      );

    updateTag("transactions");
    return { success: true };
  },
  { errorMessage: "Failed to merge duplicates" },
);

/**
 * Dismiss a duplicate pair so it won't be flagged again.
 */
export const dismissDuplicate = createSafeAction<
  { transactionId1: string; transactionId2: string },
  { success: boolean }
>(
  async (input, userId) => {
    // Store IDs in sorted order for consistent lookup
    const [id1, id2] = [input.transactionId1, input.transactionId2].sort();

    await db.insert(dismissedDuplicate).values({
      userId,
      transactionId1: id1,
      transactionId2: id2,
    });

    updateTag("duplicates");
    return { success: true };
  },
  { errorMessage: "Failed to dismiss duplicate" },
);
