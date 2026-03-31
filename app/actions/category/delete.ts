"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { categoryTag } from "@/lib/cache/tags";

export const deleteCategory = createSafeAction<string, void>(
  async (categoryId, userId) => {
    // Check if category has linked transactions
    const linkedTransactions = await db
      .select({ id: transaction.id })
      .from(transaction)
      .where(eq(transaction.categoryId, categoryId))
      .limit(1);

    if (linkedTransactions.length > 0) {
      throw new Error(
        "Cannot delete category with linked transactions. Please reassign them first.",
      );
    }

    await db
      .delete(category)
      .where(and(eq(category.id, categoryId), eq(category.userId, userId)));

    updateTag(categoryTag(userId));
    revalidatePath("/settings");
    revalidatePath("/dashboard");
  },
  { errorMessage: "Failed to delete category" },
);
