"use server";

import { addMonths, parse } from "date-fns";
import { and, count, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { auth } from "@/lib/auth";

const PAGE_SIZE = 10; // 1ページあたりの表示件数

export async function getTransaction(page: number = 1, month?: string) {
  // ページ番号が1未満にならないように補正
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * PAGE_SIZE;

  try {
    let whereCondition: SQL | undefined;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // month引数がある場合、その月の1日〜翌月1日の範囲条件を作成 ("2025-01" -> 2025-01-01 00:00:00)
    if (month && session) {
      // 開始日: 指定月の1日 00:00:00
      const startDate = parse(month, "yyyy-MM", new Date());

      // 終了日: 翌月の1日 00:00:00
      const endDate = addMonths(startDate, 1);

      // date >= startDate AND date < endDate
      whereCondition = and(
        eq(transaction.userId, session.user.id),
        gte(transaction.date, startDate),
        lt(transaction.date, endDate),
      );
    }

    // データ取得 (最新順、10件、指定位置から)
    const rows = await db
      .select({
        t: transaction,
        c: category,
      })
      .from(transaction)
      .leftJoin(category, eq(transaction.categoryId, category.id))
      .where(whereCondition)
      .orderBy(desc(transaction.date))
      .limit(PAGE_SIZE)
      .offset(offset);

    const data = rows.map(({ t, c }) => ({
      ...t,
      category: c?.slug ?? t.category, // Relation priority, fallback to legacy
    }));

    // 総件数の取得
    // count() は [{ count: 123 }] のような配列を返す
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(transaction)
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
    console.error("Failed to fetch transaction:", error);
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
