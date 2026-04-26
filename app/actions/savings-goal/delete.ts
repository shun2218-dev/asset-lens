"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
import { savingsGoal } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { savingsGoalTag } from "@/lib/cache/tags";

export const deleteSavingsGoal = createSafeAction<string, void>(
  async (id, userId) => {
    const existing = await db.query.savingsGoal.findFirst({
      where: and(eq(savingsGoal.id, id), eq(savingsGoal.userId, userId)),
    });

    if (!existing) {
      throw new Error("目標が見つかりません");
    }

    await db.delete(savingsGoal).where(eq(savingsGoal.id, id));

    updateTag(savingsGoalTag(userId));
    revalidatePath("/dashboard");
    revalidatePath("/settings");
  },
  { errorMessage: "Failed to delete savings goal" },
);
