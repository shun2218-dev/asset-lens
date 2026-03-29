"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { budget } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getBudgets() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }

  try {
    return await db.query.budget.findMany({
      where: eq(budget.userId, session.user.id),
      with: { category: true },
    });
  } catch (error) {
    console.error("Failed to get budgets:", error);
    return [];
  }
}
