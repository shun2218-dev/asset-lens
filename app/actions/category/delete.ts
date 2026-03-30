// app/actions/category/delete.ts
"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { auth } from "@/lib/auth";
import { categoryTag } from "@/lib/cache/tags";

export async function deleteCategory(categoryId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if category has linked transactions
    const linkedTransactions = await db
      .select({ id: transaction.id })
      .from(transaction)
      .where(eq(transaction.categoryId, categoryId))
      .limit(1);

    if (linkedTransactions.length > 0) {
      return {
        success: false,
        error:
          "このカテゴリに紐づく取引があるため削除できません。先に取引のカテゴリを変更してください。",
      };
    }

    await db
      .delete(category)
      .where(
        and(eq(category.id, categoryId), eq(category.userId, session.user.id)),
      );

    updateTag(categoryTag(session.user.id));
    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "カテゴリの削除に失敗しました" };
  }
}
