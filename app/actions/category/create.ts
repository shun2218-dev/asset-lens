"use server";

import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
import { category } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { categoryTag } from "@/lib/cache/tags";

interface CreateCategoryInput {
  name: string;
  type?: "expense" | "income";
}

export const createCustomCategory = createSafeAction<
  string | CreateCategoryInput,
  void
>(
  async (input, userId) => {
    // Support both string (backward compat) and object input
    const name = typeof input === "string" ? input : input.name;
    const type =
      typeof input === "string" ? "expense" : (input.type ?? "expense");

    if (!name.trim()) {
      throw new Error("Category name is required");
    }

    await db.insert(category).values({
      name: name.trim(),
      slug: `custom_${crypto.randomUUID().split("-")[0]}`,
      type,
      userId,
      sortOrder: 100,
    });

    updateTag(categoryTag(userId));
    revalidatePath("/dashboard");
    revalidatePath("/settings");
  },
  { errorMessage: "Failed to create category" },
);
