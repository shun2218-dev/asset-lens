import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getMoneyFlow } from "./get-money-flow";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({ user: { id: "user-123" } }),
    },
  },
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

type DbMockResponse = unknown[];

/**
 * The action issues db.select() three times in sequence:
 *   1. transaction × category .from().innerJoin().where()
 *   2. budget .from().where().limit()
 *   3. transactionTag × tag .from().innerJoin().where()
 *
 * To support all three call-shapes from a single chainable factory, the
 * value returned by .where() is a Promise that ALSO has a .limit method
 * (so chains 1 and 3 can await it directly while chain 2 calls .limit
 * before awaiting). All three resolve to responses[callIndex].
 */
function setupDbSequence(responses: DbMockResponse[]) {
  let callIdx = 0;
  (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const idx = callIdx++;
    const result = responses[idx] ?? [];
    const promise = Promise.resolve(result);
    const limitFn = vi.fn(() => promise);
    const whereResult = Object.assign(promise, { limit: limitFn });
    const whereFn = vi.fn(() => whereResult);
    const innerJoinFn = vi.fn(() => ({ where: whereFn }));
    return {
      from: vi.fn(() => ({
        innerJoin: innerJoinFn,
        where: whereFn,
      })),
    };
  });
}

describe("getMoneyFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty views when there are no expense transactions", async () => {
    setupDbSequence([
      [], // tx rows
      [], // budget rows
    ]);

    const result = await getMoneyFlow("2026-04");
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.storeView.nodes).toEqual([]);
    expect(result.data.storeView.links).toEqual([]);
    expect(result.data.tagView.nodes).toEqual([]);
    expect(result.data.totalExpense).toBe(0);
    expect(result.data.rootKind).toBe("expense");
  });

  it("aggregates by category and store with budget-anchored root", async () => {
    setupDbSequence([
      [
        {
          txId: "t1",
          amount: 1000,
          storeName: "セブンイレブン",
          categoryId: "cat-food",
          categoryName: "食費",
          categoryColor: "#f97316",
          categorySlug: "food",
        },
        {
          txId: "t2",
          amount: 500,
          storeName: "セブンイレブン",
          categoryId: "cat-food",
          categoryName: "食費",
          categoryColor: "#f97316",
          categorySlug: "food",
        },
        {
          txId: "t3",
          amount: 800,
          storeName: "成城石井",
          categoryId: "cat-food",
          categoryName: "食費",
          categoryColor: "#f97316",
          categorySlug: "food",
        },
      ],
      [{ amount: 200000 }], // overall budget
      [], // no tags
    ]);

    const result = await getMoneyFlow("2026-04");
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.rootKind).toBe("budget");
    expect(result.data.rootAmount).toBe(200000);
    expect(result.data.totalExpense).toBe(2300);

    const storeLeaves = result.data.storeView.nodes.filter(
      (n) => n.level === 2,
    );
    expect(storeLeaves).toHaveLength(2);
    const sevenLeaf = storeLeaves.find((n) => n.label === "セブンイレブン");
    expect(sevenLeaf).toBeDefined();

    const link = result.data.storeView.links.find(
      (l) => l.target === sevenLeaf?.id,
    );
    expect(link?.value).toBe(1500);
  });

  it("falls back to expense total when no overall budget exists", async () => {
    setupDbSequence([
      [
        {
          txId: "t1",
          amount: 1200,
          storeName: null,
          categoryId: "cat-x",
          categoryName: "その他",
          categoryColor: null,
          categorySlug: "other",
        },
      ],
      [], // no budget
      [],
    ]);

    const result = await getMoneyFlow("2026-04");
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.rootKind).toBe("expense");
    expect(result.data.rootAmount).toBe(1200);
    const leaf = result.data.storeView.nodes.find(
      (n) => n.level === 2 && n.label === "未分類",
    );
    expect(leaf).toBeDefined();
  });

  it("splits multi-tagged transactions equally across tags", async () => {
    setupDbSequence([
      [
        {
          txId: "t1",
          amount: 3000,
          storeName: "Amazon",
          categoryId: "cat-shop",
          categoryName: "買い物",
          categoryColor: "#ec4899",
          categorySlug: "shopping",
        },
      ],
      [],
      [
        { txId: "t1", tagId: "tag-a", tagName: "本", tagColor: "#000" },
        { txId: "t1", tagId: "tag-b", tagName: "趣味", tagColor: "#000" },
        { txId: "t1", tagId: "tag-c", tagName: "ギフト", tagColor: "#000" },
      ],
    ]);

    const result = await getMoneyFlow("2026-04");
    expect(result.success).toBe(true);
    if (!result.success) return;

    const tagLeaves = result.data.tagView.nodes.filter((n) => n.level === 2);
    expect(tagLeaves).toHaveLength(3);
    const tagLinks = result.data.tagView.links.filter(
      (l) => l.source === "cat-shop",
    );
    expect(tagLinks).toHaveLength(3);
    for (const link of tagLinks) {
      expect(link.value).toBe(1000);
    }
  });

  it("groups untagged transactions under the タグなし leaf", async () => {
    setupDbSequence([
      [
        {
          txId: "t1",
          amount: 500,
          storeName: "店",
          categoryId: "c1",
          categoryName: "食費",
          categoryColor: "#000",
          categorySlug: "food",
        },
      ],
      [],
      [],
    ]);

    const result = await getMoneyFlow("2026-04");
    expect(result.success).toBe(true);
    if (!result.success) return;

    const noTagLeaf = result.data.tagView.nodes.find(
      (n) => n.level === 2 && n.label === "タグなし",
    );
    expect(noTagLeaf).toBeDefined();
  });

  it("orders categories by descending total", async () => {
    setupDbSequence([
      [
        {
          txId: "t1",
          amount: 100,
          storeName: "S1",
          categoryId: "small",
          categoryName: "小",
          categoryColor: "#000",
          categorySlug: "small",
        },
        {
          txId: "t2",
          amount: 5000,
          storeName: "S2",
          categoryId: "big",
          categoryName: "大",
          categoryColor: "#000",
          categorySlug: "big",
        },
      ],
      [],
      [],
    ]);

    const result = await getMoneyFlow("2026-04");
    expect(result.success).toBe(true);
    if (!result.success) return;

    const cats = result.data.storeView.nodes.filter((n) => n.level === 1);
    expect(cats[0].id).toBe("big");
    expect(cats[1].id).toBe("small");
  });

  it("returns error when not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (
      auth.api.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(null);

    const result = await getMoneyFlow("2026-04");
    expect(result.success).toBe(false);
  });

  it("propagates DB errors as a failure result", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB Error");
    });

    const result = await getMoneyFlow("2026-04");
    expect(result.success).toBe(false);
  });
});
