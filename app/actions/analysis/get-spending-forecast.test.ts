import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getSpendingForecast } from "./get-spending-forecast";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "user-123" },
      }),
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

vi.mock("@/app/actions/budget/get", () => ({
  getBudgets: vi.fn().mockResolvedValue([]),
}));

function mockDbSelect(total: number) {
  const whereMock = vi.fn().mockResolvedValue([{ total }]);
  const fromMock = vi.fn().mockReturnValue({ where: whereMock });
  (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: fromMock });
}

describe("getSpendingForecast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return forecast with daily rate projection", async () => {
    // Current month: 45000 spent in 15 days
    // Past 3 months: 90000, 80000, 100000
    let callCount = 0;
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: () => ({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          const totals = [45000, 90000, 80000, 100000];
          return Promise.resolve([{ total: totals[callCount - 1] ?? 0 }]);
        }),
      }),
    }));

    const result = await getSpendingForecast("2026-04");
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.currentMonth).toBe("2026-04");
    expect(result.data.daysElapsed).toBe(15);
    expect(result.data.daysInMonth).toBe(30);
    expect(result.data.currentSpend).toBe(45000);
    expect(result.data.dailyRate).toBe(3000);
    expect(result.data.projectedSpend).toBe(90000);
    expect(result.data.historicalAverage).toBe(90000);
  });

  it("should return insufficient_data when less than 7 days", async () => {
    vi.setSystemTime(new Date("2026-04-05T12:00:00Z"));
    mockDbSelect(10000);

    const result = await getSpendingForecast("2026-04");
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.status).toBe("insufficient_data");
    expect(result.data.daysElapsed).toBe(5);
  });

  it("should return over_budget when projected exceeds budget", async () => {
    const { getBudgets } = await import("@/app/actions/budget/get");
    (getBudgets as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "b1", userId: "user-123", categoryId: null, amount: 60000 },
    ]);

    let callCount = 0;
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: () => ({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          return Promise.resolve([{ total: callCount === 1 ? 50000 : 60000 }]);
        }),
      }),
    }));

    const result = await getSpendingForecast("2026-04");
    expect(result.success).toBe(true);
    if (!result.success) return;

    // 50000/15 * 30 = 100000 vs budget 60000 → over_budget
    expect(result.data.status).toBe("over_budget");
    expect(result.data.budgetAmount).toBe(60000);
  });

  it("should return error if unauthorized", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      null,
    );

    const result = await getSpendingForecast("2026-04");
    expect(result.success).toBe(false);
  });

  it("should handle DB errors gracefully", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB Error");
    });

    const result = await getSpendingForecast("2026-04");
    expect(result.success).toBe(false);
  });
});
