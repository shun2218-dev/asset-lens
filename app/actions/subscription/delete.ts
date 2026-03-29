"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { auth } from "@/lib/auth";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function deleteSubscription(id: string): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "ログインしてください" };
  }

  try {
    await db
      .delete(subscription)
      .where(
        and(
          eq(subscription.id, id),
          eq(subscription.userId, session.user.id),
        ),
      );

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete subscription:", error);
    return {
      success: false,
      error: "サブスクリプションの削除に失敗しました",
    };
  }
}
