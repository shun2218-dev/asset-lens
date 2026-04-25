"use server";

import { format, subMonths } from "date-fns";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { subscription, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export type RecurringPattern = {
  description: string;
  storeName: string | null;
  category: string;
  averageAmount: number;
  occurrences: number;
  months: string[];
  isAlreadySubscription: boolean;
};

const AMOUNT_TOLERANCE = 0.1; // ±10%
const MIN_OCCURRENCES = 3;

export const detectRecurringPatterns = createSafeAction<
  void,
  RecurringPattern[]
>(
  async (_, userId) => {
    const sixMonthsAgo = subMonths(new Date(), 6);

    // Fetch recent expense transactions
    const recentTransactions = await db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.isExpense, true),
          gte(transaction.date, sixMonthsAgo),
        ),
      );

    // Fetch existing subscriptions to exclude
    const existingSubs = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId));

    const subNames = new Set(existingSubs.map((s) => s.name.toLowerCase()));

    // Group by (storeName or description) + category
    const groups = new Map<
      string,
      {
        description: string;
        storeName: string | null;
        category: string;
        amounts: number[];
        months: Set<string>;
      }
    >();

    for (const t of recentTransactions) {
      const key = `${(t.storeName || t.description).toLowerCase()}|${t.category}`;
      if (!groups.has(key)) {
        groups.set(key, {
          description: t.description,
          storeName: t.storeName,
          category: t.category,
          amounts: [],
          months: new Set(),
        });
      }
      const group = groups.get(key)!;
      group.amounts.push(t.amount);
      group.months.add(format(t.date, "yyyy-MM"));
    }

    const patterns: RecurringPattern[] = [];

    for (const [, group] of groups) {
      // Need at least MIN_OCCURRENCES distinct months
      if (group.months.size < MIN_OCCURRENCES) continue;

      // Check amount consistency (within ±10% of average)
      const avg =
        group.amounts.reduce((a, b) => a + b, 0) / group.amounts.length;
      const allWithinTolerance = group.amounts.every(
        (a) => Math.abs(a - avg) / avg <= AMOUNT_TOLERANCE,
      );

      if (!allWithinTolerance) continue;

      const identifier = (group.storeName || group.description).toLowerCase();
      const isAlreadySub = subNames.has(identifier);

      patterns.push({
        description: group.description,
        storeName: group.storeName,
        category: group.category,
        averageAmount: Math.round(avg),
        occurrences: group.months.size,
        months: Array.from(group.months).sort(),
        isAlreadySubscription: isAlreadySub,
      });
    }

    return patterns
      .filter((p) => !p.isAlreadySubscription)
      .sort((a, b) => b.occurrences - a.occurrences);
  },
  {
    errorMessage: "Failed to detect recurring patterns",
    rateLimit: "read",
  },
);
