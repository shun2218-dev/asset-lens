"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";

export async function deleteUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    // Delete the user from the database directly
    // Cascading delete will handle related data (sessions, accounts, transactions, etc.)
    await db.delete(schema.user).where(eq(schema.user.id, session.user.id));
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete account");
  }

  return { success: true };
}
