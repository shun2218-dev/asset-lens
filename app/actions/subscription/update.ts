"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  type SubscriptionFormValues,
  subscriptionSchema,
} from "@/lib/validators";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function updateSubscription(
  id: string,
  data: SubscriptionFormValues,
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "ログインしてください" };
  }

  const parsed = subscriptionSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    await db
      .update(subscription)
      .set({
        name: parsed.data.name,
        amount: parsed.data.amount,
        billingCycle: parsed.data.billingCycle,
        nextPaymentDate: parsed.data.nextPaymentDate,
        category: parsed.data.category,
      })
      .where(
        and(eq(subscription.id, id), eq(subscription.userId, session.user.id)),
      );

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return {
      success: false,
      error: "サブスクリプションの更新に失敗しました",
    };
  }
}
