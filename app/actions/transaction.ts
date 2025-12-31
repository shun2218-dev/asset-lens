"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import {
  type TransactionFormValues,
  transactionSchema,
} from "@/lib/validators";

export async function addTransaction(data: TransactionFormValues) {
  const parsed = transactionSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
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
    return { success: false, error: "Database error" };
  }
}
