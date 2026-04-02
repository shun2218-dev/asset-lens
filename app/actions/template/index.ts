"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { unstable_cache, updateTag } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { transactionTemplate } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { auth } from "@/lib/auth";

const MAX_TEMPLATES = 20;

function templateTag(userId: string) {
  return `templates-${userId}`;
}

export async function getTemplates() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  return getTemplatesCached(session.user.id)();
}

function getTemplatesCached(userId: string) {
  return unstable_cache(
    async () => {
      return db
        .select()
        .from(transactionTemplate)
        .where(eq(transactionTemplate.userId, userId))
        .orderBy(desc(transactionTemplate.usageCount));
    },
    [`templates-${userId}`],
    {
      tags: [templateTag(userId)],
      revalidate: 3600,
    },
  );
}

interface CreateTemplateInput {
  name: string;
  amount: number;
  description?: string;
  storeName?: string;
  category: string;
  isExpense: boolean;
}

export const createTemplate = createSafeAction<
  CreateTemplateInput,
  { id: string }
>(
  async (input, userId) => {
    const existing = await db
      .select({ id: transactionTemplate.id })
      .from(transactionTemplate)
      .where(eq(transactionTemplate.userId, userId));

    if (existing.length >= MAX_TEMPLATES) {
      throw new Error(
        `Maximum ${MAX_TEMPLATES} templates allowed. Delete unused templates first.`,
      );
    }

    const [result] = await db
      .insert(transactionTemplate)
      .values({
        userId,
        name: input.name,
        amount: input.amount,
        description: input.description ?? "",
        storeName: input.storeName ?? null,
        category: input.category,
        isExpense: input.isExpense,
      })
      .returning({ id: transactionTemplate.id });

    updateTag(templateTag(userId));
    return { id: result.id };
  },
  { errorMessage: "Failed to create template" },
);

interface UpdateTemplateInput {
  id: string;
  name: string;
  amount: number;
  description?: string;
  storeName?: string;
  category: string;
  isExpense: boolean;
}

export const updateTemplate = createSafeAction<UpdateTemplateInput, void>(
  async (input, userId) => {
    await db
      .update(transactionTemplate)
      .set({
        name: input.name,
        amount: input.amount,
        description: input.description ?? "",
        storeName: input.storeName ?? null,
        category: input.category,
        isExpense: input.isExpense,
      })
      .where(
        and(
          eq(transactionTemplate.id, input.id),
          eq(transactionTemplate.userId, userId),
        ),
      );

    updateTag(templateTag(userId));
  },
  { errorMessage: "Failed to update template" },
);

export const deleteTemplate = createSafeAction<string, void>(
  async (id, userId) => {
    await db
      .delete(transactionTemplate)
      .where(
        and(
          eq(transactionTemplate.id, id),
          eq(transactionTemplate.userId, userId),
        ),
      );

    updateTag(templateTag(userId));
  },
  { errorMessage: "Failed to delete template" },
);

export const incrementTemplateUsage = createSafeAction<string, void>(
  async (id, userId) => {
    await db
      .update(transactionTemplate)
      .set({
        usageCount: sql`${transactionTemplate.usageCount} + 1`,
      })
      .where(
        and(
          eq(transactionTemplate.id, id),
          eq(transactionTemplate.userId, userId),
        ),
      );

    updateTag(templateTag(userId));
  },
  { errorMessage: "Failed to update template usage" },
);
