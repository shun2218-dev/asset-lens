"use server";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";

export async function getSummary() {
  try {
    // グラフ用なので全件取得（limitなし）
    // 必要なら where で「今年だけ」などに絞ることも可能
    const allTransactions = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date));

    // 収支の合計
    const totalIncome = allTransactions
      .filter((t) => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = allTransactions
      .filter((t) => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // カテゴリ別支出 (円グラフ用)
    const categoryMap = new Map<string, number>();
    allTransactions
      .filter((t) => t.isExpense) // 支出のみ
      .forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    // 配列に変換してソート
    const categoryStats = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount); // 金額が多い順

    // 月別推移 (棒グラフ用)
    // "2023-12" のようなキーで集計
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    allTransactions.forEach((t) => {
      const monthKey = t.date.toISOString().slice(0, 7); // "YYYY-MM"
      const current = monthlyMap.get(monthKey) || { income: 0, expense: 0 };

      if (t.isExpense) {
        current.expense += t.amount;
      } else {
        current.income += t.amount;
      }
      monthlyMap.set(monthKey, current);
    });

    // 日付順に並べ替え
    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      summary: {
        totalIncome,
        totalExpense,
        balance,
      },
      categoryStats,
      monthlyStats,
    };
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    // エラー時の空データ
    return {
      summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
      categoryStats: [],
      monthlyStats: [],
    };
  }
}
