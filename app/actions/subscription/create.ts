"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import {
  type SubscriptionFormValues,
  subscriptionSchema,
} from "@/lib/validators";

export const createSubscription = createSafeAction<
  SubscriptionFormValues,
  void
>(
  async (data, userId) => {
    const parsed = subscriptionSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    await db.insert(subscription).values({
      userId,
      name: parsed.data.name,
      amount: parsed.data.amount,
      billingCycle: parsed.data.billingCycle,
      nextPaymentDate: parsed.data.nextPaymentDate,
      category: parsed.data.category,
      currency: "JPY",
      status: "active",
    });

    revalidatePath("/settings");
  },
  { errorMessage: "Failed to create subscription" },
);
