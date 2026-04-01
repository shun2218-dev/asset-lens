import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getSummary } from "./get-summary";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "user-123" },
      }),
    },
  },
}));

// Mock db
vi.mock("@/db", () => {
  return {
    db: {
      select: vi.fn(),
    },
  };
});

// Mock mail client
vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe("getSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTransactions = [
    {
      id: "1",
      amount: 1000,
      date: new Date("2024-01-01"),
      isExpense: true,
      category: "food",
      categoryId: "cat-1",
    },
    {
      id: "2",
      amount: 5000,
      date: new Date("2024-01-15"),
      isExpense: false, // Income
      category: "salary",
      categoryId: "cat-2",
    },
    {
      id: "3",
      amount: 2000,
      date: new Date("2024-02-01"), // Different month
      isExpense: true,
      category: "transport",
      categoryId: "cat-3",
    },
  ];

  it("should return summary for the specified month", async () => {
    // Mock db.select chain
    const orderByMock = vi.fn().mockResolvedValue(mockTransactions);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await getSummary("2024-01");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.currentMonth).toBe("2024-01");
    expect(result.data.summary.totalIncome).toBe(5000);
    expect(result.data.summary.totalExpense).toBe(1000);
    expect(result.data.summary.balance).toBe(4000);
    expect(result.data.categoryStats).toHaveLength(1);
    expect(result.data.categoryStats[0].category).toBe("cat-1");
    expect(result.data.monthlyStats).toHaveLength(2);
    expect(result.data.monthlyStats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          month: "2024-01",
          income: 5000,
          expense: 1000,
        }),
        expect.objectContaining({ month: "2024-02", income: 0, expense: 2000 }),
      ]),
    );
  });

  it("should return error if unauthorized", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await getSummary("2024-01");

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toBe("Please sign in to continue");
    expect(db.select).not.toHaveBeenCalled();
  });

  it("should handle error gracefully", async () => {
    (db.select as any).mockImplementation(() => {
      throw new Error("DB Error");
    });

    const result = await getSummary("2024-01");

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toBe("DB Error");
  });
});
