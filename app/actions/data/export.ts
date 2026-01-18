"use server";

import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { auth } from "@/lib/auth";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";

export async function exportData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const data = await db
    .select()
    .from(transaction)
    .where(eq(transaction.userId, session.user.id))
    .orderBy(desc(transaction.date));

  // CSVヘッダー
  const header = "日付,内容,金額,カテゴリ,収支タイプ\n";

  // CSVボディ
  const rows = data
    .map((t) => {
      const date = format(t.date, "yyyy-MM-dd");
      // カンマを含む文字列対策でダブルクォートで囲む
      const description = `"${t.description.replace(/"/g, '""')}"`;
      const amount = t.amount;
      // カテゴリIDを日本語ラベルに変換 (なければIDのまま)
      const category = EXPENSE_CATEGORY_LABELS[t.category] || t.category;
      const type = t.isExpense ? "支出" : "収入";

      return `${date},${description},${amount},${category},${type}`;
    })
    .join("\n");

  return header + rows;
}
