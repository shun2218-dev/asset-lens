"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { savingsGoal } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { savingsGoalTag } from "@/lib/cache/tags";

const depositSchema = z.object({
  goalId: z.string().uuid(),
  amount: z.number().int().min(1, "入金額は1円以上にしてください"),
});

type DepositInput = z.infer<typeof depositSchema>;

export type DepositResult = {
  newAmount: number;
  completed: boolean;
};

export const depositToGoal = createSafeAction<DepositInput, DepositResult>(
  async (input, userId) => {
    const parsed = depositSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0].message);
    }

    const { goalId, amount } = parsed.data;

    const goal = await db.query.savingsGoal.findFirst({
      where: and(eq(savingsGoal.id, goalId), eq(savingsGoal.userId, userId)),
    });

    if (!goal) {
      throw new Error("目標が見つかりません");
    }

    if (goal.status !== "active") {
      throw new Error("この目標はアクティブではありません");
    }

    const newAmount = goal.currentAmount + amount;
    const completed = newAmount >= goal.targetAmount;

    await db
      .update(savingsGoal)
      .set({
        currentAmount: newAmount,
        status: completed ? "completed" : "active",
      })
      .where(eq(savingsGoal.id, goalId));

    updateTag(savingsGoalTag(userId));
    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return { newAmount, completed };
  },
  { errorMessage: "Failed to deposit to savings goal" },
);
