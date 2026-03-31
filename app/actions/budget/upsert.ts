"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
import { budget } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { budgetTag } from "@/lib/cache/tags";

interface UpsertBudgetData {
  categoryId: string | null; // null = overall budget
  amount: number;
}

export const upsertBudget = createSafeAction<UpsertBudgetData, void>(
  async (data, userId) => {
    if (data.amount <= 0) {
      throw new Error("Budget amount must be greater than 0");
    }

    // Check if budget already exists for this user + category combination
    const existing = await db.query.budget.findFirst({
      where: and(
        eq(budget.userId, userId),
        data.categoryId
          ? eq(budget.categoryId, data.categoryId)
          : isNull(budget.categoryId),
      ),
    });

    if (existing) {
      await db
        .update(budget)
        .set({ amount: data.amount })
        .where(eq(budget.id, existing.id));
    } else {
      await db.insert(budget).values({
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
      });
    }

    updateTag(budgetTag(userId));
    revalidatePath("/dashboard");
    revalidatePath("/settings");
  },
  { errorMessage: "Failed to save budget" },
);
