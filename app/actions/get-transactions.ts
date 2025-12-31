"use server";

import { and, count, desc, gte, lt, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";

const PAGE_SIZE = 10; // 1ページあたりの表示件数

export async function getTransactions(page: number = 1, month?: string) {
  // ページ番号が1未満にならないように補正
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * PAGE_SIZE;

  try {
    let whereCondition: SQL | undefined;

    // month引数がある場合、その月の1日〜翌月1日の範囲条件を作成
    if (month) {
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10);

      // 開始日: 指定月の1日 00:00:00
      const startDate = new Date(year, m - 1, 1);
      // 終了日: 翌月の1日 00:00:00 (自動的に年を跨ぐ処理もJSが行います)
      const endDate = new Date(year, m, 1);

      // date >= startDate AND date < endDate
      whereCondition = and(
        gte(transactions.date, startDate),
        lt(transactions.date, endDate),
      );
    }

    // データ取得 (最新順、10件、指定位置から)
    const data = await db
      .select()
      .from(transactions)
      .where(whereCondition)
      .orderBy(desc(transactions.date))
      .limit(PAGE_SIZE)
      .offset(offset);

    // 総件数の取得
    // count() は [{ count: 123 }] のような配列を返す
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(transactions)
      .where(whereCondition);

    const totalCount = totalCountResult?.count ?? 0;

    // 総ページ数の計算
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return {
      data,
      metadata: {
        totalCount,
        totalPages,
        currentPage: safePage,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    // エラー時は空データを返す
    return {
      data: [],
      metadata: {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}
