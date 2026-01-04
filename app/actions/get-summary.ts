"use server";

import { format } from "date-fns";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { transaction } from "@/db/schema";

export async function getSummary(month?: string) {
  try {
    // グラフ用なので全件取得（limitなし）
    // 必要なら where で「今年だけ」などに絞ることも可能
    const allTransactions = await db
      .select()
      .from(transaction)
      .orderBy(desc(transaction.date));

    const targetMonth = month || format(new Date(), "yyyy-MM");

    // サマリーカード & 円グラフ用: 「指定した月」のデータのみ抽出
    const monthlyTransactions = allTransactions.filter((t) => {
      return format(t.date, "yyyy-MM") === targetMonth;
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
      const monthKey = format(t.date, "yyyy-MM");
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
    return {
      currentMonth: format(new Date(), "yyyy-MM"),
      summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
      categoryStats: [],
      monthlyStats: [],
    };
  }
}
