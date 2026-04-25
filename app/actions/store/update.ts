"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { store } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

const updateStoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "店舗名を入力してください").max(100),
});

export const updateStore = createSafeAction<
  z.infer<typeof updateStoreSchema>,
  void
>(
  async (input, userId) => {
    const { id, name } = updateStoreSchema.parse(input);
    const trimmedName = name.trim();

    // Check ownership
    const [existing] = await db
      .select()
      .from(store)
      .where(and(eq(store.id, id), eq(store.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new Error("店舗が見つかりません");
    }

    // Check for duplicate name
    const [duplicate] = await db
      .select()
      .from(store)
      .where(and(eq(store.userId, userId), eq(store.name, trimmedName)))
      .limit(1);

    if (duplicate && duplicate.id !== id) {
      throw new Error("同じ名前の店舗が既に存在します");
    }

    await db.update(store).set({ name: trimmedName }).where(eq(store.id, id));
    revalidatePath("/settings");
  },
  { errorMessage: "Failed to update store" },
);
