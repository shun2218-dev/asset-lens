"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  type BulkTransactionFormValues,
  bulkTransactionSchema,
} from "@/lib/validators";
import type { TransactionResult } from "@/types";

export async function createBulkTransaction(
  data: BulkTransactionFormValues,
): Promise<TransactionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "ログインしてください" };
  }

  const parsed = bulkTransactionSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    const normalizedDate = new Date(
      Date.UTC(
        parsed.data.date.getFullYear(),
        parsed.data.date.getMonth(),
        parsed.data.date.getDate(),
      ),
    );

    // Resolve category IDs to slugs in parallel
    const categoryIds = [
      ...new Set(parsed.data.entries.map((e) => e.category)),
    ];
    const categoryRows = await db
      .select()
      .from(category)
      .where(
        // Fetch all needed categories
        eq(category.id, categoryIds[0]),
      );

    // Build a map for all needed categories
    const categoryMap = new Map<string, string>();
    for (const catId of categoryIds) {
      const [catData] = await db
        .select()
        .from(category)
        .where(eq(category.id, catId))
        .limit(1);
      if (!catData) {
        return { success: false, error: `カテゴリが見つかりません: ${catId}` };
      }
      categoryMap.set(catId, catData.slug);
    }

    // Build insert values
    const values = parsed.data.entries.map((entry) => ({
      userId: session.user.id,
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
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk add transactions:", error);
    return { success: false, error: "一括登録に失敗しました" };
  }
}
