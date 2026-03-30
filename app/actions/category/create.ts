// app/actions/category/create.ts
"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { category } from "@/db/schema";
import { auth } from "@/lib/auth";
import { categoryTag } from "@/lib/cache/tags";

interface CreateCategoryInput {
  name: string;
  type?: "expense" | "income";
}

export async function createCustomCategory(
  input: string | CreateCategoryInput,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Support both string (backward compat) and object input
  const name = typeof input === "string" ? input : input.name;
  const type =
    typeof input === "string" ? "expense" : (input.type ?? "expense");

  if (!name.trim()) {
    throw new Error("カテゴリ名を入力してください");
  }

  try {
    await db.insert(category).values({
      name: name.trim(),
      slug: `custom_${crypto.randomUUID().split("-")[0]}`,
      type,
      userId: session.user.id,
      sortOrder: 100,
    });

    updateTag(categoryTag(session.user.id));
    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "カテゴリの作成に失敗しました" };
  }
}
