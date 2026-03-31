"use server";

import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeQuery } from "@/lib/actions/safe-action";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";

export const exportData = createSafeQuery(
  async (userId) => {
    const data = await db
      .select({
        t: transaction,
        c: category,
      })
      .from(transaction)
      .leftJoin(category, eq(transaction.categoryId, category.id))
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.date));

    // CSV header
    const header = "日付,内容,金額,カテゴリ,収支タイプ\n";

    // CSV body
    const rows = data
      .map(({ t, c }) => {
        const date = format(t.date, "yyyy-MM-dd");
        // Escape commas by wrapping in double quotes
        const description = `"${t.description.replace(/"/g, '""')}"`;
        const amount = t.amount;

        // Resolve category label
        const catKey = c?.slug || t.category;
        const categoryLabel = EXPENSE_CATEGORY_LABELS[catKey] || catKey;
        const type = t.isExpense ? "支出" : "収入";

        return `${date},${description},${amount},${categoryLabel},${type}`;
      })
      .join("\n");

    return header + rows;
  },
  { errorMessage: "Failed to export data" },
);
