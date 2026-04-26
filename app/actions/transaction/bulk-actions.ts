"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "少なくとも1件選択してください"),
});

export const bulkDeleteTransactions = createSafeAction<
  z.infer<typeof bulkDeleteSchema>,
  { deletedCount: number }
>(
  async (input, userId) => {
    const { ids } = bulkDeleteSchema.parse(input);

    const result = await db
      .delete(transaction)
      .where(and(eq(transaction.userId, userId), inArray(transaction.id, ids)));

    revalidatePath("/dashboard");
    revalidatePath("/transaction");

    return { deletedCount: result.rowCount ?? ids.length };
  },
  { errorMessage: "Failed to bulk delete transactions" },
);

const bulkUpdateCategorySchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "少なくとも1件選択してください"),
  categoryId: z.string().uuid("カテゴリを選択してください"),
});

export const bulkUpdateCategory = createSafeAction<
  z.infer<typeof bulkUpdateCategorySchema>,
  { updatedCount: number }
>(
  async (input, userId) => {
    const { ids, categoryId } = bulkUpdateCategorySchema.parse(input);

    const result = await db
      .update(transaction)
      .set({ categoryId })
      .where(and(eq(transaction.userId, userId), inArray(transaction.id, ids)));

    revalidatePath("/dashboard");
    revalidatePath("/transaction");

    return { updatedCount: result.rowCount ?? ids.length };
  },
  { errorMessage: "Failed to bulk update category" },
);
