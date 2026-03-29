"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { store } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getStores() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  try {
    const stores = await db
      .select()
      .from(store)
      .where(eq(store.userId, session.user.id))
      .orderBy(store.name);

    return stores;
  } catch (error) {
    console.error("Failed to fetch stores:", error);
    return [];
  }
}
