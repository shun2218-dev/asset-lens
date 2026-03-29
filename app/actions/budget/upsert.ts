"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { budget } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";

interface UpsertBudgetData {
  categoryId: string | null; // null = overall budget
  amount: number;
}

export async function upsertBudget(
  data: UpsertBudgetData,
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "ログインしてください" };
  }

  if (data.amount <= 0) {
    return { success: false, error: "予算は1円以上で設定してください" };
  }

  try {
    // Check if budget already exists for this user + category combination
    const existing = await db.query.budget.findFirst({
      where: and(
        eq(budget.userId, session.user.id),
        data.categoryId
          ? eq(budget.categoryId, data.categoryId)
          : isNull(budget.categoryId),
      ),
    });

    if (existing) {
      // Update existing budget
      await db
        .update(budget)
        .set({ amount: data.amount })
        .where(eq(budget.id, existing.id));
    } else {
      // Create new budget
      await db.insert(budget).values({
        userId: session.user.id,
        categoryId: data.categoryId,
        amount: data.amount,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to upsert budget:", error);
    return { success: false, error: "予算の設定に失敗しました" };
  }
}
