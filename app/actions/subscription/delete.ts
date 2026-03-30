"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export const deleteSubscription = createSafeAction<string, void>(
  async (id, userId) => {
    await db
      .delete(subscription)
      .where(and(eq(subscription.id, id), eq(subscription.userId, userId)));

    revalidatePath("/settings");
  },
  { errorMessage: "Failed to delete subscription" },
);
