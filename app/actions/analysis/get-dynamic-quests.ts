"use server";

import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeQuery } from "@/lib/actions/safe-action";

export type QuestStatus = "on_track" | "warning" | "failed" | "completed";

export type Quest = {
  id: string;
  cadence: "weekly" | "monthly";
  targetKind: "store" | "category";
  targetLabel: string;
  /** Store name (no FK) for store-target, categoryId for category-target. */
  targetId: string;
  thresholdJpy: number;
  spentJpy: number;
  progressPct: number;
  status: QuestStatus;
  periodStart: string;
  periodEnd: string;
};

export type DynamicQuestsResult = {
  generatedAt: string;
  weekly: Quest[];
  monthly: Quest[];
  insufficientHistory: boolean;
};

const QUEST_THRESHOLD_FLOOR_JPY = 1000;
const WEEKLY_REDUCTION_FACTOR = 0.7; // 30% cut versus implicit weekly average
const MONTHLY_REDUCTION_FACTOR = 0.85; // 15% cut versus prev-month total
const TOP_N = 3;

/**
 * Generate weekly + monthly quests derived from the previous month's top
 * stores and categories. Quests are stateless: they always reflect the most
 * recent history and current-period progress, so accept/dismiss state lives
 * in the UI layer (or future schema work).
 */
export const getDynamicQuests = createSafeQuery<DynamicQuestsResult>(
  async (userId) => {
    const now = new Date();
    const generatedAt = now.toISOString();

    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(prevMonthStart);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Pull every expense transaction across both windows in a single query
    // (prev-month start → current-month end). Aggregation happens in TS,
    // matching the convention of other analysis actions.
    const rows = await db
      .select({
        amount: transaction.amount,
        date: transaction.date,
        storeName: transaction.storeName,
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
      })
      .from(transaction)
      .innerJoin(category, eq(transaction.categoryId, category.id))
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.isExpense, true),
          gte(transaction.date, prevMonthStart),
          lte(transaction.date, monthEnd),
        ),
      );

    if (rows.length === 0) {
      return {
        generatedAt,
        weekly: [],
        monthly: [],
        insufficientHistory: true,
      };
    }

    // Bucket by period.
    const inRange = (d: Date, start: Date, end: Date) =>
      d.getTime() >= start.getTime() && d.getTime() <= end.getTime();

    const prevMonthRows = rows.filter((r) =>
      inRange(r.date, prevMonthStart, prevMonthEnd),
    );
    const weekRows = rows.filter((r) => inRange(r.date, weekStart, weekEnd));
    const monthRows = rows.filter((r) => inRange(r.date, monthStart, monthEnd));

    if (prevMonthRows.length === 0) {
      return {
        generatedAt,
        weekly: [],
        monthly: [],
        insufficientHistory: true,
      };
    }

    // Top 3 stores from the previous month, ignoring null storeName.
    const storeTotals = new Map<string, number>();
    for (const r of prevMonthRows) {
      if (!r.storeName) continue;
      storeTotals.set(
        r.storeName,
        (storeTotals.get(r.storeName) ?? 0) + r.amount,
      );
    }
    const topStores = Array.from(storeTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N);

    // Top 3 categories from the previous month.
    const catTotals = new Map<string, { name: string; total: number }>();
    for (const r of prevMonthRows) {
      const existing = catTotals.get(r.categoryId);
      if (existing) {
        existing.total += r.amount;
      } else {
        catTotals.set(r.categoryId, {
          name: r.categoryName,
          total: r.amount,
        });
      }
    }
    const topCats = Array.from(catTotals.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, TOP_N);

    // Current-period spend lookups.
    const weekSpendByStore = new Map<string, number>();
    for (const r of weekRows) {
      if (!r.storeName) continue;
      weekSpendByStore.set(
        r.storeName,
        (weekSpendByStore.get(r.storeName) ?? 0) + r.amount,
      );
    }
    const monthSpendByCat = new Map<string, number>();
    for (const r of monthRows) {
      monthSpendByCat.set(
        r.categoryId,
        (monthSpendByCat.get(r.categoryId) ?? 0) + r.amount,
      );
    }

    const periodStart = (d: Date) => format(d, "yyyy-MM-dd");

    const weekly: Quest[] = topStores.map(([storeName, prevTotal]) => {
      const threshold = Math.max(
        QUEST_THRESHOLD_FLOOR_JPY,
        Math.round((prevTotal / 4) * WEEKLY_REDUCTION_FACTOR),
      );
      const spent = weekSpendByStore.get(storeName) ?? 0;
      return buildQuest({
        cadence: "weekly",
        targetKind: "store",
        targetId: storeName,
        targetLabel: storeName,
        thresholdJpy: threshold,
        spentJpy: spent,
        periodStart: periodStart(weekStart),
        periodEnd: periodStart(weekEnd),
        now,
        periodEndDate: weekEnd,
      });
    });

    const monthly: Quest[] = topCats.map(([catId, info]) => {
      const threshold = Math.max(
        QUEST_THRESHOLD_FLOOR_JPY,
        Math.round(info.total * MONTHLY_REDUCTION_FACTOR),
      );
      const spent = monthSpendByCat.get(catId) ?? 0;
      return buildQuest({
        cadence: "monthly",
        targetKind: "category",
        targetId: catId,
        targetLabel: info.name,
        thresholdJpy: threshold,
        spentJpy: spent,
        periodStart: periodStart(monthStart),
        periodEnd: periodStart(monthEnd),
        now,
        periodEndDate: monthEnd,
      });
    });

    return {
      generatedAt,
      weekly,
      monthly,
      insufficientHistory: false,
    };
  },
  { errorMessage: "Failed to fetch dynamic quests", rateLimit: "read" },
);

type BuildQuestArgs = {
  cadence: "weekly" | "monthly";
  targetKind: "store" | "category";
  targetId: string;
  targetLabel: string;
  thresholdJpy: number;
  spentJpy: number;
  periodStart: string;
  periodEnd: string;
  now: Date;
  periodEndDate: Date;
};

function buildQuest(args: BuildQuestArgs): Quest {
  const progressPct = Math.min(
    200,
    args.thresholdJpy > 0
      ? Math.round((args.spentJpy / args.thresholdJpy) * 100)
      : 0,
  );
  const periodOver = args.now.getTime() > args.periodEndDate.getTime();
  const status = resolveStatus(progressPct, periodOver);

  return {
    id: hashQuestId(
      args.cadence,
      args.targetKind,
      args.targetId,
      args.periodStart,
    ),
    cadence: args.cadence,
    targetKind: args.targetKind,
    targetLabel: args.targetLabel,
    targetId: args.targetId,
    thresholdJpy: args.thresholdJpy,
    spentJpy: args.spentJpy,
    progressPct,
    status,
    periodStart: args.periodStart,
    periodEnd: args.periodEnd,
  };
}

function resolveStatus(
  progressPct: number,
  periodOver: boolean,
): QuestStatus {
  if (progressPct > 100) return "failed";
  if (periodOver) return "completed";
  if (progressPct >= 70) return "warning";
  return "on_track";
}

/**
 * Stable, deterministic id for a quest so React keys stay consistent across
 * renders and so the optional client-side dismissal layer (future) can
 * reference quests without server state.
 */
function hashQuestId(
  cadence: string,
  targetKind: string,
  targetId: string,
  periodStart: string,
): string {
  return `${cadence}:${targetKind}:${targetId}:${periodStart}`;
}
