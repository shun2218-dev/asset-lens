import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getAnnualReport } from "./get-annual-report";

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({ user: { id: "user-123" } }),
    },
  },
}));
vi.mock("@/db", () => ({ db: { select: vi.fn() } }));
vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

const mockTransactions = [
  {
    id: "1",
    amount: 300000,
    date: new Date("2025-01-15"),
    isExpense: false,
    category: "salary",
  },
  {
    id: "2",
    amount: 50000,
    date: new Date("2025-01-20"),
    isExpense: true,
    category: "rent",
  },
  {
    id: "3",
    amount: 10000,
    date: new Date("2025-02-10"),
    isExpense: true,
    category: "food",
  },
  {
    id: "4",
    amount: 300000,
    date: new Date("2025-02-15"),
    isExpense: false,
    category: "salary",
  },
  {
    id: "5",
    amount: 20000,
    date: new Date("2025-03-05"),
    isExpense: true,
    category: "food",
  },
];

describe("getAnnualReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return annual report with correct totals", async () => {
    let callCount = 0;
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: () => ({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve(mockTransactions);
          // Previous year query
          return Promise.resolve([{ income: 0, expense: 0 }]);
        }),
      }),
    }));

    const result = await getAnnualReport(2025);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.year).toBe(2025);
    expect(result.data.totalIncome).toBe(600000);
    expect(result.data.totalExpense).toBe(80000);
    expect(result.data.balance).toBe(520000);
    expect(result.data.savingsRate).toBeGreaterThan(0);
    expect(result.data.monthlyBreakdown).toHaveLength(12);
    expect(result.data.categoryStats.length).toBeGreaterThan(0);
    expect(result.data.categoryStats[0].category).toBe("rent");
  });

  it("should return error if unauthorized", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      null,
    );

    const result = await getAnnualReport(2025);
    expect(result.success).toBe(false);
  });

  it("should handle DB errors gracefully", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB Error");
    });

    const result = await getAnnualReport(2025);
    expect(result.success).toBe(false);
  });

  it("should include previous year comparison when data exists", async () => {
    let callCount = 0;
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: () => ({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve(mockTransactions);
          return Promise.resolve([{ income: 500000, expense: 100000 }]);
        }),
      }),
    }));

    const result = await getAnnualReport(2025);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.previousYear).not.toBeNull();
    expect(result.data.previousYear?.totalIncome).toBe(500000);
  });
});
