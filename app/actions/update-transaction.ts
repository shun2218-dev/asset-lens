"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import type { transactionSchema } from "@/lib/validators";
import type { TransactionResult } from "@/types";

type TransactionValues = z.infer<typeof transactionSchema>;

export async function updateTransaction(
  id: number,
  data: TransactionValues,
): Promise<TransactionResult> {
  try {
    await db
      .update(transactions)
      .set({
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: data.date,
        isExpense: data.isExpense,
      })
      .where(eq(transactions.id, id));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "更新に失敗しました" };
  }
}
