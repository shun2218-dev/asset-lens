"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
import { budget } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { budgetTag } from "@/lib/cache/tags";

export const deleteBudget = createSafeAction<string, void>(
  async (id, userId) => {
    await db
      .delete(budget)
      .where(and(eq(budget.id, id), eq(budget.userId, userId)));

    updateTag(budgetTag(userId));
    revalidatePath("/dashboard");
    revalidatePath("/settings");
  },
  { errorMessage: "Failed to delete budget" },
);
