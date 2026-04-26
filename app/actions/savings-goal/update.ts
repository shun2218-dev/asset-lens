"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { savingsGoal } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { savingsGoalTag } from "@/lib/cache/tags";

const updateSavingsGoalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  targetAmount: z.number().int().min(1).optional(),
  deadline: z.date().nullable().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
});

type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;

export const updateSavingsGoal = createSafeAction<UpdateSavingsGoalInput, void>(
  async (input, userId) => {
    const parsed = updateSavingsGoalSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0].message);
    }

    const { id, ...updates } = parsed.data;

    const existing = await db.query.savingsGoal.findFirst({
      where: and(eq(savingsGoal.id, id), eq(savingsGoal.userId, userId)),
    });

    if (!existing) {
      throw new Error("目標が見つかりません");
    }

    const setValues: Record<string, unknown> = {};
    if (updates.name !== undefined) setValues.name = updates.name;
    if (updates.targetAmount !== undefined)
      setValues.targetAmount = updates.targetAmount;
    if (updates.deadline !== undefined) setValues.deadline = updates.deadline;
    if (updates.icon !== undefined) setValues.icon = updates.icon;
    if (updates.color !== undefined) setValues.color = updates.color;
    if (updates.status !== undefined) setValues.status = updates.status;

    if (Object.keys(setValues).length === 0) return;

    await db.update(savingsGoal).set(setValues).where(eq(savingsGoal.id, id));

    updateTag(savingsGoalTag(userId));
    revalidatePath("/dashboard");
    revalidatePath("/settings");
  },
  { errorMessage: "Failed to update savings goal" },
);
