"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import {
  type TransactionFormValues,
  transactionSchema,
} from "@/lib/validators";
import type { TransactionResult } from "@/types";

export async function createTransaction(
  data: TransactionFormValues,
): Promise<TransactionResult> {
  const parsed = transactionSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    await db.insert(transactions).values({
      amount: parsed.data.amount,
      description: parsed.data.description,
      category: parsed.data.category,
      date: parsed.data.date,
      isExpense: parsed.data.isExpense,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, error: "データの追加に失敗しました" };
  }
}
