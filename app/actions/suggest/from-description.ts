"use server";

import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

interface SuggestionResult {
  categories: Array<{ category: string; count: number }>;
  storeName: string | null;
}

export const suggestFromDescription = createSafeAction<
  string,
  SuggestionResult
>(
  async (description, userId) => {
    if (!description || description.length < 2) {
      return { categories: [], storeName: null };
    }

    const results = await db
      .select({
        category: transaction.category,
        storeName: transaction.storeName,
        count: sql<number>`count(*)::int`,
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          ilike(transaction.description, `%${description}%`),
        ),
      )
      .groupBy(transaction.category, transaction.storeName)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const categoryMap = new Map<string, number>();
    let topStoreName: string | null = null;
    let topStoreCount = 0;

    for (const row of results) {
      const existing = categoryMap.get(row.category) ?? 0;
      categoryMap.set(row.category, existing + row.count);

      if (row.storeName && row.count > topStoreCount) {
        topStoreName = row.storeName;
        topStoreCount = row.count;
      }
    }

    const categories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { categories, storeName: topStoreName };
  },
  {
    errorMessage: "Failed to suggest categories",
    rateLimit: "read",
  },
);
