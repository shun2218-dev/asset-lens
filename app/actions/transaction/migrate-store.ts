"use server";

import { and, eq, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * storeName が未設定の取引データを取得
 */
export async function getTransactionsWithoutStore() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  const rows = await db
    .select({
      id: transaction.id,
      description: transaction.description,
      storeName: transaction.storeName,
      date: transaction.date,
      amount: transaction.amount,
      category: transaction.category,
    })
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, session.user.id),
        or(isNull(transaction.storeName), eq(transaction.storeName, "")),
      ),
    )
    .orderBy(transaction.date);

  return rows;
}

/**
 * 店舗名を一括で抽出・更新する
 */
export async function applyStoreNameMigration(
  updates: {
    id: string;
    storeName: string;
    description: string;
  }[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "認証されていません" };
  }

  try {
    let updatedCount = 0;

    for (const update of updates) {
      // ユーザーのデータのみ更新可能 (セキュリティ)
      await db
        .update(transaction)
        .set({
          storeName: update.storeName || null,
          description: update.description,
        })
        .where(
          and(
            eq(transaction.id, update.id),
            eq(transaction.userId, session.user.id),
          ),
        );
      updatedCount++;
    }

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
    revalidatePath("/settings");

    return { success: true, updatedCount };
  } catch (error) {
    console.error("Store name migration error:", error);
    return { success: false, error: "更新に失敗しました" };
  }
}
