// app/actions/get-transactions.ts
"use server";

import { count, desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";

const PAGE_SIZE = 10; // 1ページあたりの表示件数

export async function getTransactions(page: number = 1) {
  // ページ番号が1未満にならないように補正
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * PAGE_SIZE;

  try {
    // データ取得 (最新順、10件、指定位置から)
    const data = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date))
      .limit(PAGE_SIZE)
      .offset(offset);

    // 総件数の取得
    // count() は [{ count: 123 }] のような配列を返すので展開して取得
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(transactions);
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
    // エラー時は空データを返してアプリが落ちないようにする
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
