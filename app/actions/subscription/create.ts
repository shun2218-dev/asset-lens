"use server";

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

export async function createSubscription(
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
    await db.insert(subscription).values({
      userId: session.user.id,
      name: parsed.data.name,
      amount: parsed.data.amount,
      billingCycle: parsed.data.billingCycle,
      nextPaymentDate: parsed.data.nextPaymentDate,
      category: parsed.data.category,
      currency: "JPY", // デフォルト
      status: "active", // デフォルト
    });

    revalidatePath("/settings"); // 設定ページを更新
    return { success: true };
  } catch (error) {
    console.error("Failed to add subscription:", error);
    return { success: false, error: "サブスクリプションの追加に失敗しました" };
  }
}
