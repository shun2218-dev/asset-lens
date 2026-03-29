"use server";

import { addMonths, parse } from "date-fns";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lt,
  or,
  type SQL,
} from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { TransactionFilterParams, TransactionSortParams } from "@/types";

const PAGE_SIZE = 10; // 1ページあたりの表示件数

export async function getTransaction(
  page: number = 1,
  month?: string,
  filters?: TransactionFilterParams,
  sort?: TransactionSortParams,
) {
  // ページ番号が1未満にならないように補正
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * PAGE_SIZE;

  try {
    const conditions: SQL[] = [];
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      conditions.push(eq(transaction.userId, session.user.id));
    }

    // month引数がある場合、その月の1日〜翌月1日の範囲条件を作成 ("2025-01" -> 2025-01-01 00:00:00)
    if (month && !filters?.dateFrom && !filters?.dateTo) {
      const startDate = parse(month, "yyyy-MM", new Date());
      const endDate = addMonths(startDate, 1);
      conditions.push(gte(transaction.date, startDate));
      conditions.push(lt(transaction.date, endDate));
    }

    // Filter: date range
    // Calendar picker returns local timezone dates (e.g. JST 3/23 00:00 = UTC 3/22 15:00),
    // but DB stores dates as UTC midnight. Normalize to UTC midnight for correct comparison.
    if (filters?.dateFrom) {
      const d = filters.dateFrom;
      const utcFrom = new Date(
        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
      );
      conditions.push(gte(transaction.date, utcFrom));
    }
    if (filters?.dateTo) {
      // dateTo is inclusive: use next day UTC midnight as exclusive upper bound
      const d = filters.dateTo;
      const utcToEnd = new Date(
        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + 1),
      );
      conditions.push(lt(transaction.date, utcToEnd));
    }

    // Filter: category
    if (filters?.categoryId) {
      conditions.push(eq(transaction.categoryId, filters.categoryId));
    }

    // Filter: text search (description + storeName)
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const query = `%${filters.searchQuery.trim()}%`;
      conditions.push(
        or(
          ilike(transaction.description, query),
          ilike(transaction.storeName, query),
        ) as SQL,
      );
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Build sort order
    // Secondary sort by id ensures deterministic pagination
    // (without it, same-date records can shift between pages)
    let orderByClause: SQL[] = [];
    if (sort?.sortBy) {
      const direction = sort.sortOrder === "asc" ? asc : desc;
      switch (sort.sortBy) {
        case "date":
          orderByClause = [direction(transaction.date), desc(transaction.id)];
          break;
        case "category":
          orderByClause = [
            direction(transaction.category),
            desc(transaction.id),
          ];
          break;
        case "amount":
          orderByClause = [direction(transaction.amount), desc(transaction.id)];
          break;
        default:
          orderByClause = [desc(transaction.date), desc(transaction.id)];
      }
    } else {
      orderByClause = [desc(transaction.date), desc(transaction.id)];
    }

    // データ取得
    const rows = await db
      .select({
        t: transaction,
        c: category,
      })
      .from(transaction)
      .leftJoin(category, eq(transaction.categoryId, category.id))
      .where(whereCondition)
      .orderBy(...orderByClause)
      .limit(PAGE_SIZE)
      .offset(offset);

    const data = rows.map(({ t, c }) => ({
      ...t,
      category: c?.slug ?? t.category, // Relation priority, fallback to legacy
    }));

    // 総件数の取得
    const [totalCountResult] = await db
      .select({ count: count() })
      .from(transaction)
      .where(whereCondition);

    const totalCount = totalCountResult?.count ?? 0;
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
