"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { store } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export const createStore = createSafeAction<string, { id: string }>(
  async (name, userId) => {
    if (!name || name.trim().length === 0) {
      throw new Error("Store name is required");
    }

    const trimmedName = name.trim();

    // Check for duplicates
    const existing = await db
      .select()
      .from(store)
      .where(and(eq(store.userId, userId), eq(store.name, trimmedName)))
      .limit(1);

    if (existing.length > 0) {
      // Return existing store ID instead of error
      return { id: existing[0].id };
    }

    const [newStore] = await db
      .insert(store)
      .values({
        userId,
        name: trimmedName,
      })
      .returning({ id: store.id });

    return { id: newStore.id };
  },
  { errorMessage: "Failed to create store" },
);
