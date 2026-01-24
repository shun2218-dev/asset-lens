"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import type { transactionSchema } from "@/lib/validators";
import type { TransactionResult } from "@/types";

type TransactionValues = z.infer<typeof transactionSchema>;

export async function updateTransaction(
  id: string,
  data: TransactionValues,
): Promise<TransactionResult> {
  try {
    // カテゴリ情報を取得
    const [categoryData] = await db
      .select()
      .from(category)
      .where(eq(category.id, data.category))
      .limit(1);

    if (!categoryData) {
      return { success: false, error: "カテゴリが見つかりません" };
    }

    await db
      .update(transaction)
      .set({
        amount: data.amount,
        description: data.description,
        category: categoryData.slug, // Legacy column: use slug
        categoryId: data.category, // New column: use UUID
        date: data.date,
        isExpense: data.isExpense,
      })
      .where(eq(transaction.id, id));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "更新に失敗しました" };
  }
}
