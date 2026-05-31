import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getDynamicQuests } from "./get-dynamic-quests";

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
  db: { select: vi.fn() },
}));

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

type Row = {
  amount: number;
  date: Date;
  storeName: string | null;
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
};

function mockRows(rows: Row[]) {
  (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
    from: () => ({
      innerJoin: () => ({
        where: () => Promise.resolve(rows),
      }),
    }),
  }));
}

const CAT = {
  food: {
    categoryId: "cat-food",
    categoryName: "食費",
    categoryColor: "#f97316",
  },
  shop: {
    categoryId: "cat-shop",
    categoryName: "買い物",
    categoryColor: "#ec4899",
  },
  transport: {
    categoryId: "cat-trans",
    categoryName: "交通費",
    categoryColor: "#3b82f6",
  },
};

describe("getDynamicQuests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Wednesday 2026-04-15. Previous month is March 2026.
    vi.setSystemTime(new Date("2026-04-15T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("flags insufficientHistory when there are no transactions at all", async () => {
    mockRows([]);
    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.insufficientHistory).toBe(true);
    expect(result.data.weekly).toEqual([]);
    expect(result.data.monthly).toEqual([]);
  });

  it("flags insufficientHistory when prev month is empty even if current month has data", async () => {
    mockRows([
      {
        amount: 1000,
        date: new Date("2026-04-10T00:00:00Z"),
        storeName: "Store",
        ...CAT.food,
      },
    ]);
    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.insufficientHistory).toBe(true);
  });

  it("generates up to 3 weekly store quests with 30% cut threshold", async () => {
    mockRows([
      // Prev month (March) — three stores
      {
        amount: 40000,
        date: new Date("2026-03-05T00:00:00Z"),
        storeName: "セブンイレブン",
        ...CAT.food,
      },
      {
        amount: 20000,
        date: new Date("2026-03-12T00:00:00Z"),
        storeName: "Amazon",
        ...CAT.shop,
      },
      {
        amount: 10000,
        date: new Date("2026-03-20T00:00:00Z"),
        storeName: "成城石井",
        ...CAT.food,
      },
      // Current week (April 13-19) some spend at top store
      {
        amount: 2000,
        date: new Date("2026-04-15T00:00:00Z"),
        storeName: "セブンイレブン",
        ...CAT.food,
      },
    ]);

    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.weekly).toHaveLength(3);
    const [seven, amazon, sjishi] = result.data.weekly;

    // Order is by descending prev-month total.
    expect(seven.targetLabel).toBe("セブンイレブン");
    expect(amazon.targetLabel).toBe("Amazon");
    expect(sjishi.targetLabel).toBe("成城石井");

    // Threshold = round(40000 / 4 * 0.7) = 7000.
    expect(seven.thresholdJpy).toBe(7000);
    expect(seven.spentJpy).toBe(2000);
    expect(seven.progressPct).toBe(Math.round((2000 / 7000) * 100));
    expect(seven.status).toBe("on_track");
  });

  it("applies the 1000 JPY threshold floor for tiny prev-month totals", async () => {
    mockRows([
      {
        amount: 200, // very small prev-month spend
        date: new Date("2026-03-05T00:00:00Z"),
        storeName: "Tiny",
        ...CAT.food,
      },
    ]);
    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.weekly[0].thresholdJpy).toBe(1000);
  });

  it("skips prev-month rows with null storeName when ranking weekly quests", async () => {
    mockRows([
      {
        amount: 50000,
        date: new Date("2026-03-05T00:00:00Z"),
        storeName: null, // ignored for weekly
        ...CAT.food,
      },
      {
        amount: 8000,
        date: new Date("2026-03-10T00:00:00Z"),
        storeName: "セブンイレブン",
        ...CAT.food,
      },
    ]);
    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.weekly).toHaveLength(1);
    expect(result.data.weekly[0].targetLabel).toBe("セブンイレブン");
  });

  it("generates monthly category quests with 15% cut threshold", async () => {
    mockRows([
      {
        amount: 50000,
        date: new Date("2026-03-05T00:00:00Z"),
        storeName: "S1",
        ...CAT.food,
      },
      {
        amount: 30000,
        date: new Date("2026-03-15T00:00:00Z"),
        storeName: "S2",
        ...CAT.shop,
      },
      // Current month (April) spending in food category
      {
        amount: 20000,
        date: new Date("2026-04-10T00:00:00Z"),
        storeName: "S1",
        ...CAT.food,
      },
    ]);

    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;

    const [food, shop] = result.data.monthly;
    expect(food.targetLabel).toBe("食費");
    expect(food.cadence).toBe("monthly");
    expect(food.targetKind).toBe("category");
    // 50000 * 0.85 = 42500
    expect(food.thresholdJpy).toBe(42500);
    expect(food.spentJpy).toBe(20000);
    expect(shop.thresholdJpy).toBe(Math.round(30000 * 0.85));
  });

  it("transitions through on_track / warning / failed status thresholds", async () => {
    mockRows([
      // prev month
      {
        amount: 10000,
        date: new Date("2026-03-10T00:00:00Z"),
        storeName: "Big",
        ...CAT.food,
      },
      // current week — set spend so progressPct lands in each band
      // thresholdJpy = round(10000/4 * 0.7) = 1750. Use 1200 = ~69% on_track.
      {
        amount: 1200,
        date: new Date("2026-04-15T00:00:00Z"),
        storeName: "Big",
        ...CAT.food,
      },
    ]);
    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.weekly[0].status).toBe("on_track");
  });

  it("marks status as warning between 70 and 100 percent", async () => {
    // threshold 1750, spent 1500 → 86%
    mockRows([
      {
        amount: 10000,
        date: new Date("2026-03-10T00:00:00Z"),
        storeName: "Big",
        ...CAT.food,
      },
      {
        amount: 1500,
        date: new Date("2026-04-15T00:00:00Z"),
        storeName: "Big",
        ...CAT.food,
      },
    ]);
    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.weekly[0].status).toBe("warning");
  });

  it("marks status as failed when over 100 percent", async () => {
    // threshold 1750, spent 2500 → 143%
    mockRows([
      {
        amount: 10000,
        date: new Date("2026-03-10T00:00:00Z"),
        storeName: "Big",
        ...CAT.food,
      },
      {
        amount: 2500,
        date: new Date("2026-04-15T00:00:00Z"),
        storeName: "Big",
        ...CAT.food,
      },
    ]);
    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.weekly[0].status).toBe("failed");
  });

  it("caps progressPct at 200 to keep UI bars sane", async () => {
    mockRows([
      // floor threshold 1000, spend 50000 → would be 5000%
      {
        amount: 1000,
        date: new Date("2026-03-10T00:00:00Z"),
        storeName: "Tiny",
        ...CAT.food,
      },
      {
        amount: 50000,
        date: new Date("2026-04-15T00:00:00Z"),
        storeName: "Tiny",
        ...CAT.food,
      },
    ]);
    const result = await getDynamicQuests();
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.weekly[0].progressPct).toBe(200);
    expect(result.data.weekly[0].status).toBe("failed");
  });

  it("returns an error when not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (
      auth.api.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(null);

    const result = await getDynamicQuests();
    expect(result.success).toBe(false);
  });

  it("returns an error when DB throws", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB Error");
    });
    const result = await getDynamicQuests();
    expect(result.success).toBe(false);
  });
});
