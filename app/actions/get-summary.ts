"use server";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";

export async function getSummary(month?: string) {
  try {
    // グラフ用なので全件取得（limitなし）
    // 必要なら where で「今年だけ」などに絞ることも可能
    const allTransactions = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date));

    const now = new Date();
    const targetMonth =
      month ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // サマリーカード & 円グラフ用: 「指定した月」のデータのみ抽出
    const monthlyTransactions = allTransactions.filter((t) => {
      const tMonth = t.date.toISOString().slice(0, 7); // "YYYY-MM"
      return tMonth === targetMonth;
    });

    // 収支の合計
    const totalIncome = monthlyTransactions
      .filter((t) => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthlyTransactions
      .filter((t) => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // カテゴリ別支出 (円グラフ用)
    const categoryMap = new Map<string, number>();
    monthlyTransactions
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

      if (t.isExpense) current.expense += t.amount;
      else current.income += t.amount;
      monthlyMap.set(monthKey, current);
    });

    // 日付順に並べ替え
    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      currentMonth: targetMonth,
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
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return {
      currentMonth,
      summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
      categoryStats: [],
      monthlyStats: [],
    };
  }
}
