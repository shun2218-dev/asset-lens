"use server";

import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

interface SuggestionResult {
  categories: Array<{ categoryId: string; slug: string; count: number }>;
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
        categoryId: transaction.categoryId,
        slug: category.slug,
        storeName: transaction.storeName,
        count: sql<number>`count(*)::int`,
      })
      .from(transaction)
      .innerJoin(category, eq(transaction.categoryId, category.id))
      .where(
        and(
          eq(transaction.userId, userId),
          ilike(transaction.description, `%${description}%`),
        ),
      )
      .groupBy(transaction.categoryId, category.slug, transaction.storeName)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const categoryMap = new Map<string, { slug: string; count: number }>();
    let topStoreName: string | null = null;
    let topStoreCount = 0;

    for (const row of results) {
      const existing = categoryMap.get(row.categoryId);
      if (existing) {
        existing.count += row.count;
      } else {
        categoryMap.set(row.categoryId, {
          slug: row.slug,
          count: row.count,
        });
      }

      if (row.storeName && row.count > topStoreCount) {
        topStoreName = row.storeName;
        topStoreCount = row.count;
      }
    }

    const categories = Array.from(categoryMap.entries())
      .map(([categoryId, { slug, count }]) => ({ categoryId, slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { categories, storeName: topStoreName };
  },
  {
    errorMessage: "Failed to suggest categories",
    rateLimit: "read",
  },
);
