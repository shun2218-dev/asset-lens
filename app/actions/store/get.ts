"use server";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { store } from "@/db/schema";
import { auth } from "@/lib/auth";
import { storeTag } from "@/lib/cache/tags";

export async function getStores() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  return getStoresCached(session.user.id)();
}

/** Cached store query — revalidated via storeTag */
function getStoresCached(userId: string) {
  return unstable_cache(
    async () => {
      try {
        const stores = await db
          .select()
          .from(store)
          .where(eq(store.userId, userId))
          .orderBy(store.name);

        return stores;
      } catch (error) {
        console.error("Failed to fetch stores:", error);
        return [];
      }
    },
    [`stores-${userId}`],
    {
      tags: [storeTag(userId)],
      revalidate: 3600,
    },
  );
}
