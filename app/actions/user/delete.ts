"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { createSafeQuery } from "@/lib/actions/safe-action";

export const deleteUser = createSafeQuery(
  async (userId) => {
    // Delete the user from the database directly
    // Cascading delete will handle related data (sessions, accounts, transactions, etc.)
    await db.delete(schema.user).where(eq(schema.user.id, userId));
  },
  { errorMessage: "Failed to delete account" },
);
