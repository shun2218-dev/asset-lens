"use server";

import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import {
  calculateCategoryBreakdown,
  calculateMonthlyTrends,
  calculatePeriodSummary,
} from "@/lib/analysis/metrics";
import { auth } from "@/lib/auth";

export async function getSummary(month?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // デフォルト値の定義
  const currentMonth = month || format(new Date(), "yyyy-MM");
  const emptyResult = {
    currentMonth,
    summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
    categoryStats: [],
    monthlyStats: [],
  };

  if (!session) {
    return emptyResult;
  }

  try {
    // グラフ用なので全件取得（limitなし）
    // 必要なら where で「今年だけ」などに絞ることも可能
    const allTransactions = await db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, session.user.id))
      .orderBy(desc(transaction.date));

    // サマリーカード & 円グラフ用: 「指定した月」のデータのみ抽出
    const monthlyTransactions = allTransactions.filter((t) => {
      return format(t.date, "yyyy-MM") === currentMonth;
    });

    const summary = calculatePeriodSummary(monthlyTransactions);
    const categoryStats = calculateCategoryBreakdown(monthlyTransactions);
    const monthlyStats = calculateMonthlyTrends(allTransactions);

    return {
      currentMonth,
      summary,
      categoryStats,
      monthlyStats,
    };
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    // エラー時の空データ
    return emptyResult;
  }
}
