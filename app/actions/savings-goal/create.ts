"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { savingsGoal } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { savingsGoalTag } from "@/lib/cache/tags";

const createSavingsGoalSchema = z.object({
  name: z.string().min(1, "目標名を入力してください"),
  targetAmount: z.number().int().min(1, "目標金額は1円以上にしてください"),
  deadline: z.date().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;

export const createSavingsGoal = createSafeAction<CreateSavingsGoalInput, void>(
  async (input, userId) => {
    const parsed = createSavingsGoalSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0].message);
    }

    const { name, targetAmount, deadline, icon, color } = parsed.data;

    if (deadline && deadline <= new Date()) {
      throw new Error("期限は未来の日付にしてください");
    }

    await db.insert(savingsGoal).values({
      userId,
      name,
      targetAmount,
      deadline: deadline ?? null,
      icon: icon ?? "piggy-bank",
      color: color ?? "#6366f1",
    });

    updateTag(savingsGoalTag(userId));
    revalidatePath("/dashboard");
    revalidatePath("/settings");
  },
  { errorMessage: "Failed to create savings goal" },
);
