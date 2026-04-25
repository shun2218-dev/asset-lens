"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import type { InsertTag, SelectTag } from "@/db/schema";
import { tag, transactionTag } from "@/db/schema";
import { createSafeAction, createSafeQuery } from "@/lib/actions/safe-action";

export const getTags = createSafeQuery<SelectTag[]>(
  async (userId) => {
    return db
      .select()
      .from(tag)
      .where(eq(tag.userId, userId))
      .orderBy(tag.name);
  },
  { errorMessage: "Failed to fetch tags" },
);

export const createTag = createSafeAction<
  { name: string; color?: string },
  SelectTag
>(
  async (input, userId) => {
    const [newTag] = await db
      .insert(tag)
      .values({
        userId,
        name: input.name,
        color: input.color ?? "#6366f1",
      })
      .returning();
    return newTag;
  },
  { errorMessage: "Failed to create tag" },
);

export const updateTag = createSafeAction<
  { id: string; name: string; color: string },
  SelectTag
>(
  async (input, userId) => {
    const [updated] = await db
      .update(tag)
      .set({ name: input.name, color: input.color })
      .where(and(eq(tag.id, input.id), eq(tag.userId, userId)))
      .returning();
    if (!updated) throw new Error("Tag not found");
    return updated;
  },
  { errorMessage: "Failed to update tag" },
);

export const deleteTag = createSafeAction<string, void>(
  async (tagId, userId) => {
    await db.delete(tag).where(and(eq(tag.id, tagId), eq(tag.userId, userId)));
  },
  { errorMessage: "Failed to delete tag" },
);

export const setTransactionTags = createSafeAction<
  { transactionId: string; tagIds: string[] },
  void
>(
  async (input, _userId) => {
    // Remove existing tags for this transaction
    await db
      .delete(transactionTag)
      .where(eq(transactionTag.transactionId, input.transactionId));

    // Insert new tags
    if (input.tagIds.length > 0) {
      await db.insert(transactionTag).values(
        input.tagIds.map((tagId) => ({
          transactionId: input.transactionId,
          tagId,
        })),
      );
    }
  },
  { errorMessage: "Failed to update transaction tags" },
);

export const getTransactionTags = createSafeAction<
  string,
  { transactionId: string; tagId: string }[]
>(
  async (transactionId, _userId) => {
    return db
      .select()
      .from(transactionTag)
      .where(eq(transactionTag.transactionId, transactionId));
  },
  { errorMessage: "Failed to fetch transaction tags", rateLimit: "read" },
);
