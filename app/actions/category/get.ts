"use server";

import { asc, eq, isNull, or } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { category } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getCategories() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return [];

  try {
    const categories = await db
      .select()
      .from(category)
      .where(or(isNull(category.userId), eq(category.userId, session.user.id)))
      .orderBy(asc(category.sortOrder), asc(category.createdAt));

    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}
