"use server";

import {
  endOfMonth,
  format,
  parse,
  startOfMonth,
} from "date-fns";
import { and, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  budget,
  category,
  tag,
  transaction,
  transactionTag,
} from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";

export type MoneyFlowNode = {
  id: string;
  level: 0 | 1 | 2;
  label: string;
  parentId?: string;
  color?: string;
};

export type MoneyFlowLink = {
  source: string;
  target: string;
  value: number;
};

export type MoneyFlowView = {
  nodes: MoneyFlowNode[];
  links: MoneyFlowLink[];
};

export type MoneyFlowResult = {
  month: string;
  rootKind: "budget" | "expense";
  rootAmount: number;
  totalExpense: number;
  storeView: MoneyFlowView;
  tagView: MoneyFlowView;
};

const ROOT_ID = "__root__";
const STORE_NULL_ID = "__store_null__";
const STORE_NULL_LABEL = "未分類";
const TAG_NONE_ID = "__tag_none__";
const TAG_NONE_LABEL = "タグなし";

export const getMoneyFlow = createSafeAction<
  string | undefined,
  MoneyFlowResult
>(
  async (input, userId) => {
    const month = input || format(new Date(), "yyyy-MM");
    const monthStart = startOfMonth(parse(month, "yyyy-MM", new Date()));
    const monthEnd = endOfMonth(monthStart);

    // 1. Pull every expense transaction in the month joined with category meta.
    const txRows = await db
      .select({
        txId: transaction.id,
        amount: transaction.amount,
        storeName: transaction.storeName,
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        categorySlug: category.slug,
      })
      .from(transaction)
      .innerJoin(category, eq(transaction.categoryId, category.id))
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.isExpense, true),
          gte(transaction.date, monthStart),
          lte(transaction.date, monthEnd),
        ),
      );

    // 2. Resolve overall budget (categoryId IS NULL) for the root node.
    const [overall] = await db
      .select({ amount: budget.amount })
      .from(budget)
      .where(and(eq(budget.userId, userId), isNull(budget.categoryId)))
      .limit(1);

    const totalExpense = txRows.reduce((sum, r) => sum + r.amount, 0);
    const rootAmount = overall?.amount ?? totalExpense;
    const rootKind: "budget" | "expense" = overall ? "budget" : "expense";
    const rootLabel = rootKind === "budget" ? "今月の予算" : "今月の支出";

    if (txRows.length === 0) {
      const emptyView: MoneyFlowView = { nodes: [], links: [] };
      return {
        month,
        rootKind,
        rootAmount,
        totalExpense: 0,
        storeView: emptyView,
        tagView: emptyView,
      };
    }

    // 3. Tag join for the transactions in this month only.
    const txIds = txRows.map((r) => r.txId);
    const tagRows = await db
      .select({
        txId: transactionTag.transactionId,
        tagId: tag.id,
        tagName: tag.name,
        tagColor: tag.color,
      })
      .from(transactionTag)
      .innerJoin(tag, eq(transactionTag.tagId, tag.id))
      .where(inArray(transactionTag.transactionId, txIds));

    const tagsByTx = new Map<string, { id: string; name: string; color: string }[]>();
    for (const row of tagRows) {
      const list = tagsByTx.get(row.txId) ?? [];
      list.push({ id: row.tagId, name: row.tagName, color: row.tagColor });
      tagsByTx.set(row.txId, list);
    }

    // 4. Build category aggregates.
    const categoryMap = new Map<
      string,
      { id: string; name: string; color: string; slug: string; total: number }
    >();
    for (const row of txRows) {
      const existing = categoryMap.get(row.categoryId);
      if (existing) {
        existing.total += row.amount;
      } else {
        categoryMap.set(row.categoryId, {
          id: row.categoryId,
          name: row.categoryName,
          color: row.categoryColor ?? "#94a3b8",
          slug: row.categorySlug,
          total: row.amount,
        });
      }
    }

    // 5. Build store-leaf aggregates: Map<categoryId, Map<storeKey, total>>.
    type LeafBucket = { id: string; label: string; total: number };
    const storeLeavesByCat = new Map<string, Map<string, LeafBucket>>();
    for (const row of txRows) {
      const storeKey = row.storeName ?? STORE_NULL_ID;
      const storeLabel = row.storeName ?? STORE_NULL_LABEL;
      const leafId = `store:${row.categoryId}:${storeKey}`;
      const inner = storeLeavesByCat.get(row.categoryId) ?? new Map();
      const existing = inner.get(leafId);
      if (existing) {
        existing.total += row.amount;
      } else {
        inner.set(leafId, { id: leafId, label: storeLabel, total: row.amount });
      }
      storeLeavesByCat.set(row.categoryId, inner);
    }

    // 6. Build tag-leaf aggregates with equal split for multi-tag rows.
    const tagLeavesByCat = new Map<string, Map<string, LeafBucket>>();
    for (const row of txRows) {
      const tags = tagsByTx.get(row.txId) ?? [];
      const inner = tagLeavesByCat.get(row.categoryId) ?? new Map();
      if (tags.length === 0) {
        const leafId = `tag:${row.categoryId}:${TAG_NONE_ID}`;
        const existing = inner.get(leafId);
        if (existing) {
          existing.total += row.amount;
        } else {
          inner.set(leafId, {
            id: leafId,
            label: TAG_NONE_LABEL,
            total: row.amount,
          });
        }
      } else {
        const portion = row.amount / tags.length;
        for (const t of tags) {
          const leafId = `tag:${row.categoryId}:${t.id}`;
          const existing = inner.get(leafId);
          if (existing) {
            existing.total += portion;
          } else {
            inner.set(leafId, { id: leafId, label: t.name, total: portion });
          }
        }
      }
      tagLeavesByCat.set(row.categoryId, inner);
    }

    // 7. Project to the public view shape.
    const buildView = (
      leavesByCat: Map<string, Map<string, LeafBucket>>,
    ): MoneyFlowView => {
      const nodes: MoneyFlowNode[] = [
        { id: ROOT_ID, level: 0, label: rootLabel, color: "#6366f1" },
      ];
      const links: MoneyFlowLink[] = [];

      const sortedCats = Array.from(categoryMap.values()).sort(
        (a, b) => b.total - a.total,
      );
      for (const cat of sortedCats) {
        nodes.push({
          id: cat.id,
          level: 1,
          label: cat.name,
          color: cat.color,
        });
        links.push({ source: ROOT_ID, target: cat.id, value: cat.total });

        const leaves = leavesByCat.get(cat.id);
        if (!leaves) continue;
        const sortedLeaves = Array.from(leaves.values())
          .filter((l) => l.total > 0)
          .sort((a, b) => b.total - a.total);
        for (const leaf of sortedLeaves) {
          // Round to integer JPY to match the integer-only schema convention.
          const rounded = Math.round(leaf.total);
          if (rounded <= 0) continue;
          nodes.push({
            id: leaf.id,
            level: 2,
            label: leaf.label,
            parentId: cat.id,
            color: cat.color,
          });
          links.push({ source: cat.id, target: leaf.id, value: rounded });
        }
      }
      return { nodes, links };
    };

    return {
      month,
      rootKind,
      rootAmount,
      totalExpense,
      storeView: buildView(storeLeavesByCat),
      tagView: buildView(tagLeavesByCat),
    };
  },
  { errorMessage: "Failed to fetch money flow", rateLimit: "read" },
);
