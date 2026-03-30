"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import {
  type TransactionFormValues,
  transactionSchema,
} from "@/lib/validators";

export const createTransaction = createSafeAction<TransactionFormValues, void>(
  async (data, userId) => {
    const parsed = transactionSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    // Fetch category info
    const [categoryData] = await db
      .select()
      .from(category)
      .where(eq(category.id, parsed.data.category))
      .limit(1);

    if (!categoryData) {
      throw new Error("Category not found");
    }

    await db.insert(transaction).values({
      userId,
      amount: parsed.data.amount,
      description: parsed.data.description,
      storeName: parsed.data.storeName || null,
      category: categoryData.slug, // Legacy column: use slug
      categoryId: parsed.data.category, // New column: use UUID
      date: parsed.data.date,
      isExpense: parsed.data.isExpense,
    });

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
  },
  { errorMessage: "Failed to create transaction" },
);
