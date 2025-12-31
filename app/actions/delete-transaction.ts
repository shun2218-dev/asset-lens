"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { transactions } from "@/db/schema";

export async function deleteTransaction(id: number) {
  try {
    await db.delete(transactions).where(eq(transactions.id, id));

    // トップページを再検証して、リストを更新
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "削除に失敗しました" };
  }
}
