"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { store } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";

export async function createStore(
  name: string,
): Promise<ActionResult & { id?: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "ログインしてください" };
  }

  if (!name || name.trim().length === 0) {
    return { success: false, error: "店舗名を入力してください" };
  }

  const trimmedName = name.trim();

  try {
    // Check for duplicates
    const existing = await db
      .select()
      .from(store)
      .where(
        and(eq(store.userId, session.user.id), eq(store.name, trimmedName)),
      )
      .limit(1);

    if (existing.length > 0) {
      // Return existing store ID instead of error
      return { success: true, id: existing[0].id };
    }

    const [newStore] = await db
      .insert(store)
      .values({
        userId: session.user.id,
        name: trimmedName,
      })
      .returning({ id: store.id });

    return { success: true, id: newStore.id };
  } catch (error) {
    console.error("Failed to create store:", error);
    return { success: false, error: "店舗の登録に失敗しました" };
  }
}
