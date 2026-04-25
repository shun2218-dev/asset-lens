import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getSummaryWithComparison } from "./get-summary-with-comparison";

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

vi.mock("@/db", () => {
  return {
    db: {
      select: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

function setupDbMock(transactions: unknown[]) {
  const orderByMock = vi.fn().mockResolvedValue(transactions);
  const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
  const fromMock = vi.fn().mockReturnValue({ where: whereMock });
  (db.select as any).mockReturnValue({ from: fromMock });
}

describe("getSummaryWithComparison", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const marchTransactions = [
    {
      id: "1",
      amount: 3000,
      date: new Date("2024-03-15"),
      isExpense: true,
      categoryId: "cat-1",
    },
    {
      id: "2",
      amount: 50000,
      date: new Date("2024-03-01"),
      isExpense: false,
      categoryId: "cat-2",
    },
  ];

  const febTransactions = [
    {
      id: "3",
      amount: 2000,
      date: new Date("2024-02-10"),
      isExpense: true,
      categoryId: "cat-1",
    },
  ];

  it("should return data for the specified month", async () => {
    setupDbMock([...marchTransactions, ...febTransactions]);

    const result = await getSummaryWithComparison("2024-03");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.currentMonth).toBe("2024-03");
    expect(result.data.isFallback).toBe(false);
    expect(result.data.requestedMonth).toBe("2024-03");
    expect(result.data.summary.totalIncome).toBe(50000);
    expect(result.data.summary.totalExpense).toBe(3000);
  });

  it("should return previous month comparison data", async () => {
    setupDbMock([...marchTransactions, ...febTransactions]);

    const result = await getSummaryWithComparison("2024-03");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.previousSummary.totalExpense).toBe(2000);
    expect(result.data.previousSummary.totalIncome).toBe(0);
  });

  it("should fallback to latest month with data when current month is empty (no explicit month)", async () => {
    // Only March data exists, requesting default (which would be current month)
    // We mock the current date by providing no month param
    // Since allTransactions has data in March, it should fallback
    setupDbMock(marchTransactions);

    // Call without a month param — this will use format(new Date(), "yyyy-MM")
    // which likely won't match March 2024, so it should trigger fallback
    const result = await getSummaryWithComparison(undefined);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Since today's month has no data and March 2024 does, isFallback should be true
    expect(result.data.isFallback).toBe(true);
    expect(result.data.currentMonth).toBe("2024-03");
    expect(result.data.summary.totalIncome).toBe(50000);
  });

  it("should NOT fallback when month is explicitly specified (manual navigation)", async () => {
    setupDbMock(marchTransactions);

    // Explicitly request April 2024 — should NOT fallback even though April is empty
    const result = await getSummaryWithComparison("2024-04");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.isFallback).toBe(false);
    expect(result.data.currentMonth).toBe("2024-04");
    expect(result.data.summary.totalIncome).toBe(0);
    expect(result.data.summary.totalExpense).toBe(0);
  });

  it("should show empty state when user has zero transactions ever", async () => {
    setupDbMock([]);

    const result = await getSummaryWithComparison(undefined);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.isFallback).toBe(false);
    expect(result.data.summary.totalIncome).toBe(0);
    expect(result.data.summary.totalExpense).toBe(0);
  });

  it("should include category expense breakdown", async () => {
    setupDbMock(marchTransactions);

    const result = await getSummaryWithComparison("2024-03");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.categoryExpenses).toEqual([
      { categoryId: "cat-1", amount: 3000 },
    ]);
  });
});
