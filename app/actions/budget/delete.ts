"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { budget } from "@/db/schema";
import { auth } from "@/lib/auth";
import { budgetTag } from "@/lib/cache/tags";
import type { ActionResult } from "@/types";

export async function deleteBudget(id: string): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "ログインしてください" };
  }

  try {
    await db
      .delete(budget)
      .where(and(eq(budget.id, id), eq(budget.userId, session.user.id)));

    updateTag(budgetTag(session.user.id));
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete budget:", error);
    return { success: false, error: "予算の削除に失敗しました" };
  }
}
