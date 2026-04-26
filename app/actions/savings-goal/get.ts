"use server";

import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import type { SelectSavingsGoal } from "@/db/schema";
import { savingsGoal } from "@/db/schema";
import { createSafeQuery } from "@/lib/actions/safe-action";

export const getSavingsGoals = createSafeQuery<SelectSavingsGoal[]>(
  async (userId) => {
    return db.query.savingsGoal.findMany({
      where: and(
        eq(savingsGoal.userId, userId),
        ne(savingsGoal.status, "archived"),
      ),
      orderBy: (goals, { desc }) => [desc(goals.createdAt)],
    });
  },
  { errorMessage: "Failed to fetch savings goals" },
);
