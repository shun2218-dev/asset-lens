"use server";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { budget } from "@/db/schema";
import { auth } from "@/lib/auth";
import { budgetTag } from "@/lib/cache/tags";

export async function getBudgets() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  return getBudgetsCached(session.user.id)();
}

/** Cached budget query — revalidated via budgetTag */
function getBudgetsCached(userId: string) {
  return unstable_cache(
    async () => {
      try {
        return await db.query.budget.findMany({
          where: eq(budget.userId, userId),
          with: { category: true },
        });
      } catch (error) {
        console.error("Failed to get budgets:", error);
        return [];
      }
    },
    [`budgets-${userId}`],
    {
      tags: [budgetTag(userId)],
      revalidate: 3600,
    },
  );
}
