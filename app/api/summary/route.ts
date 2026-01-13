import { format, parse } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { auth } from "@/lib/auth/auth";

export async function GET(req: Request) {
  try {
    // 1. 認証チェック
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // ex: 2025-01

    // 指定がなければ今月
    const targetDate = monthParam
      ? parse(monthParam, "yyyy-MM", new Date())
      : new Date();

    const targetMonthKey = format(targetDate, "yyyy-MM");

    // 2. ユーザーの全データを取得（グラフ用）
    const allTransactions = await db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, session.user.id))
      .orderBy(desc(transaction.date));

    // 3. 今月のデータだけ抽出
    const monthlyTransactions = allTransactions.filter((t) => {
      return format(t.date, "yyyy-MM") === targetMonthKey;
    });

    // 4. 収支計算
    const totalIncome = monthlyTransactions
      .filter((t) => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthlyTransactions
      .filter((t) => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // 5. カテゴリ別集計 (円グラフ用)
    const categoryMap = new Map<string, number>();
    monthlyTransactions
      .filter((t) => t.isExpense)
      .forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    const categoryStats = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // 6. 月別推移 (棒グラフ用)
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    allTransactions.forEach((t) => {
      const mKey = format(t.date, "yyyy-MM");
      const current = monthlyMap.get(mKey) || { income: 0, expense: 0 };
      if (t.isExpense) current.expense += t.amount;
      else current.income += t.amount;
      monthlyMap.set(mKey, current);
    });

    // 直近6ヶ月分くらいに絞ってソート
    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // 後ろから6個

    return NextResponse.json({
      currentMonth: targetMonthKey,
      summary: { totalIncome, totalExpense, balance },
      categoryStats,
      monthlyStats,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
