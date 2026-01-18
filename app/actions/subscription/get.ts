"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { subscription } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getSubscription() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  try {
    const data = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, session.user.id))
      .orderBy(desc(subscription.createdAt));

    return data;
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return [];
  }
}
