// app/actions/category/update.ts
"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { category } from "@/db/schema";
import { auth } from "@/lib/auth";
import { categoryTag } from "@/lib/cache/tags";

interface UpdateCategoryInput {
  id: string;
  name: string;
  type: "expense" | "income";
  sortOrder?: number;
}

export async function updateCategory(input: UpdateCategoryInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!input.name.trim()) {
    return { success: false, error: "カテゴリ名を入力してください" };
  }

  try {
    const result = await db
      .update(category)
      .set({
        name: input.name.trim(),
        type: input.type,
        sortOrder: input.sortOrder,
        updatedAt: new Date(),
      })
      .where(
        and(eq(category.id, input.id), eq(category.userId, session.user.id)),
      );

    updateTag(categoryTag(session.user.id));
    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "カテゴリの更新に失敗しました" };
  }
}
