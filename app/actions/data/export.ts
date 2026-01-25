"use server";

import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
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
    .select({
      t: transaction,
      c: category,
    })
    .from(transaction)
    .leftJoin(category, eq(transaction.categoryId, category.id))
    .where(eq(transaction.userId, session.user.id))
    .orderBy(desc(transaction.date));

  // CSVヘッダー
  const header = "日付,内容,金額,カテゴリ,収支タイプ\n";

  // CSVボディ
  const rows = data
    .map(({ t, c }) => {
      const date = format(t.date, "yyyy-MM-dd");
      // カンマを含む文字列対策でダブルクォートで囲む
      const description = `"${t.description.replace(/"/g, '""')}"`;
      const amount = t.amount;
      
      // カテゴリ識別子の決定
      // 1. category table slug
      // 2. legacy category column
      const catKey = c?.slug || t.category;

      // カテゴリIDを日本語ラベルに変換 (なければIDのまま)
      // EXPENSE_CATEGORY_LABELS map keys are slugs (e.g. 'food')
      const categoryLabel = EXPENSE_CATEGORY_LABELS[catKey] || catKey;
      const type = t.isExpense ? "支出" : "収入";

      return `${date},${description},${amount},${categoryLabel},${type}`;
    })
    .join("\n");

  return header + rows;
}
