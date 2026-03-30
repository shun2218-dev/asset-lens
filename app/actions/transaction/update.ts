"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import type { transactionSchema } from "@/lib/validators";

type TransactionValues = z.infer<typeof transactionSchema>;

interface UpdateTransactionInput {
  id: string;
  data: TransactionValues;
}

export const updateTransaction = createSafeAction<UpdateTransactionInput, void>(
  async ({ id, data }, _userId) => {
    // Fetch category info
    const [categoryData] = await db
      .select()
      .from(category)
      .where(eq(category.id, data.category))
      .limit(1);

    if (!categoryData) {
      throw new Error("Category not found");
    }

    await db
      .update(transaction)
      .set({
        amount: data.amount,
        description: data.description,
        storeName: data.storeName ?? null,
        category: categoryData.slug, // Legacy column: use slug
        categoryId: data.category, // New column: use UUID
        date: data.date,
        isExpense: data.isExpense,
      })
      .where(eq(transaction.id, id));

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
  },
  { errorMessage: "Failed to update transaction" },
);
