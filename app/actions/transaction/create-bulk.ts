"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import {
  type BulkTransactionFormValues,
  bulkTransactionSchema,
} from "@/lib/validators";

export const createBulkTransaction = createSafeAction<
  BulkTransactionFormValues,
  void
>(
  async (data, userId) => {
    const parsed = bulkTransactionSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    const normalizedDate = new Date(
      Date.UTC(
        parsed.data.date.getFullYear(),
        parsed.data.date.getMonth(),
        parsed.data.date.getDate(),
      ),
    );

    // Resolve category IDs to slugs
    const categoryIds = [
      ...new Set(parsed.data.entries.map((e) => e.category)),
    ];

    const categoryMap = new Map<string, string>();
    for (const catId of categoryIds) {
      const [catData] = await db
        .select()
        .from(category)
        .where(eq(category.id, catId))
        .limit(1);
      if (!catData) {
        throw new Error(`Category not found: ${catId}`);
      }
      categoryMap.set(catId, catData.slug);
    }

    // Build insert values
    const values = parsed.data.entries.map((entry) => ({
      userId,
      amount: entry.amount,
      description: entry.description,
      storeName: entry.storeName || null,
      category: categoryMap.get(entry.category) ?? "",
      categoryId: entry.category,
      date: normalizedDate,
      isExpense: entry.isExpense,
    }));

    // Batch insert
    await db.insert(transaction).values(values);

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
  },
  { errorMessage: "Failed to create bulk transactions" },
);
