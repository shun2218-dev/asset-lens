"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { store, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export const deleteStore = createSafeAction<string, void>(
  async (id, userId) => {
    // Check ownership
    const [existing] = await db
      .select()
      .from(store)
      .where(and(eq(store.id, id), eq(store.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new Error("店舗が見つかりません");
    }

    // Check if store is referenced by transactions (by storeName match)
    const [txRef] = await db
      .select({ id: transaction.id })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.storeName, existing.name),
        ),
      )
      .limit(1);

    if (txRef) {
      throw new Error(
        "この店舗は取引で使用されています。先に取引の店舗名を変更してください。",
      );
    }

    await db
      .delete(store)
      .where(and(eq(store.id, id), eq(store.userId, userId)));
    revalidatePath("/settings");
  },
  { errorMessage: "Failed to delete store" },
);
