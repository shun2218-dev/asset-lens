"use server";

import { asc, eq, isNull, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { category } from "@/db/schema";
import { auth } from "@/lib/auth";
import { categoryTag } from "@/lib/cache/tags";

export async function getCategories() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return [];

  try {
    return await getCategoriesCached(session.user.id)();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

/** Cached category query — revalidated via categoryTag */
function getCategoriesCached(userId: string) {
  return unstable_cache(
    async () => {
      // Do NOT catch errors here — unstable_cache caches return values,
      // including error-case empty arrays. Let errors propagate so the
      // cache entry is not poisoned with an empty result.
      const categories = await db
        .select()
        .from(category)
        .where(or(isNull(category.userId), eq(category.userId, userId)))
        .orderBy(asc(category.sortOrder), asc(category.createdAt));

      return categories;
    },
    [`categories-v2-${userId}`],
    {
      tags: [categoryTag(userId)],
      revalidate: 300, // 5 min fallback
    },
  );
}
