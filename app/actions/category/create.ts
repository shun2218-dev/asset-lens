// app/actions/category/create.ts
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { category } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function createCustomCategory(name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!name.trim()) {
    throw new Error("カテゴリ名を入力してください");
  }

  try {
    await db.insert(category).values({
      name: name,
      slug: `custom_${crypto.randomUUID().split("-")[0]}`,
      type: "expense",
      userId: session.user.id,
      sortOrder: 100,
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "カテゴリの作成に失敗しました" };
  }
}
