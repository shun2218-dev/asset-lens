"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export const deleteTransaction = createSafeAction<string, void>(
  async (id, _userId) => {
    await db.delete(transaction).where(eq(transaction.id, id));

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
  },
  { errorMessage: "Failed to delete transaction" },
);
