"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import {
  type SubscriptionFormValues,
  subscriptionSchema,
} from "@/lib/validators";

interface UpdateSubscriptionInput {
  id: string;
  data: SubscriptionFormValues;
}

export const updateSubscription = createSafeAction<
  UpdateSubscriptionInput,
  void
>(
  async ({ id, data }, userId) => {
    const parsed = subscriptionSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    await db
      .update(subscription)
      .set({
        name: parsed.data.name,
        amount: parsed.data.amount,
        billingCycle: parsed.data.billingCycle,
        nextPaymentDate: parsed.data.nextPaymentDate,
        category: parsed.data.category,
      })
      .where(and(eq(subscription.id, id), eq(subscription.userId, userId)));

    revalidatePath("/settings");
  },
  { errorMessage: "Failed to update subscription" },
);
