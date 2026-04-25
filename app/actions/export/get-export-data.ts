"use server";

import { addMonths, format, parse } from "date-fns";
import { and, asc, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export type ExportTransaction = {
  date: string;
  type: "収入" | "支出";
  category: string;
  description: string;
  storeName: string;
  amount: number;
};

export type ExportData = {
  month: string;
  transactions: ExportTransaction[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  categoryBreakdown: { category: string; amount: number }[];
};

export const getExportData = createSafeAction<string, ExportData>(
  async (month, userId) => {
    const startDate = parse(month, "yyyy-MM", new Date());
    const endDate = addMonths(startDate, 1);

    const rows = await db
      .select({
        t: transaction,
        c: category,
      })
      .from(transaction)
      .leftJoin(category, eq(transaction.categoryId, category.id))
      .where(
        and(
          eq(transaction.userId, userId),
          gte(transaction.date, startDate),
          lt(transaction.date, endDate),
        ),
      )
      .orderBy(asc(transaction.date));

    const transactions: ExportTransaction[] = rows.map(({ t, c }) => ({
      date: format(t.date, "yyyy/MM/dd"),
      type: t.isExpense ? "支出" : "収入",
      category: c?.name ?? t.category,
      description: t.description,
      storeName: t.storeName ?? "",
      amount: t.amount,
    }));

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = new Map<string, number>();

    for (const row of rows) {
      if (row.t.isExpense) {
        totalExpense += row.t.amount;
        const catName = row.c?.name ?? row.t.category;
        categoryMap.set(
          catName,
          (categoryMap.get(catName) || 0) + row.t.amount,
        );
      } else {
        totalIncome += row.t.amount;
      }
    }

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      month,
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
      categoryBreakdown,
    };
  },
  { errorMessage: "Failed to fetch export data" },
);
