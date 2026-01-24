"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  type TransactionFormValues,
  transactionSchema,
} from "@/lib/validators";
import type { TransactionResult } from "@/types";

export async function createTransaction(
  data: TransactionFormValues,
): Promise<TransactionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "ログインしてください" };
  }

  const parsed = transactionSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    // カテゴリ情報を取得
    const [categoryData] = await db
      .select()
      .from(category)
      .where(eq(category.id, parsed.data.category))
      .limit(1);

    if (!categoryData) {
      return { success: false, error: "カテゴリが見つかりません" };
    }

    await db.insert(transaction).values({
      userId: session.user.id,
      amount: parsed.data.amount,
      description: parsed.data.description,
      category: categoryData.slug, // Legacy column: use slug
      categoryId: parsed.data.category, // New column: use UUID
      date: parsed.data.date,
      isExpense: parsed.data.isExpense,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, error: "データの追加に失敗しました" };
  }
}
