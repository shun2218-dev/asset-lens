"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
import { category } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { categoryTag } from "@/lib/cache/tags";

interface UpdateCategoryInput {
  id: string;
  name: string;
  type: "expense" | "income";
  sortOrder?: number;
}

export const updateCategory = createSafeAction<UpdateCategoryInput, void>(
  async (input, userId) => {
    if (!input.name.trim()) {
      throw new Error("Category name is required");
    }

    await db
      .update(category)
      .set({
        name: input.name.trim(),
        type: input.type,
        sortOrder: input.sortOrder,
        updatedAt: new Date(),
      })
      .where(and(eq(category.id, input.id), eq(category.userId, userId)));

    updateTag(categoryTag(userId));
    revalidatePath("/settings");
    revalidatePath("/dashboard");
  },
  { errorMessage: "Failed to update category" },
);
