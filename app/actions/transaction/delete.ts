"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import type { TransactionResult } from "@/types";

export async function deleteTransaction(
  id: string,
): Promise<TransactionResult> {
  try {
    await db.delete(transaction).where(eq(transaction.id, id));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "削除に失敗しました" };
  }
}
