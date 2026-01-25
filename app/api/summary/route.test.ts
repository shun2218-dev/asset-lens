import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { db } from "@/db";

// Mock next/server
vi.mock("next/server", () => {
    const NextResponse = class {
        constructor(body: any, init: any) {
            (this as any).body = body;
            (this as any).status = init?.status || 200;
        }
        static json(body: any, init: any) {
            return {
                json: async () => body,
                status: init?.status || 200,
            };
        }
    };
    return { NextResponse };
});

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

describe("API: summary", () => {
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
      isExpense: false,
      category: "salary",
      categoryId: "cat-2",
    },
     {
      id: "3",
      amount: 2000,
      date: new Date("2024-02-01"),
      isExpense: true,
      category: "transport",
      categoryId: "cat-3",
    },
  ];

  it("should return summary data for default month (now)", async () => {
     // Mock date to consistent value if needed, but the route defaults to 'new Date()'.
     // We can pass month param to fix the month.
     const req = {
         url: "http://localhost/api/summary?month=2024-01",
     };

    // Mock db.select
    const orderByMock = vi.fn().mockResolvedValue(mockTransactions);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const response = await GET(req as any);

    expect((response as any).status).toBe(200);
    const body = await (response as any).json();

    expect(body.currentMonth).toBe("2024-01");
    // Jan: Income 5000, Expense 1000 -> Balance 4000
    expect(body.summary.totalIncome).toBe(5000);
    expect(body.summary.totalExpense).toBe(1000);
    expect(body.summary.balance).toBe(4000);

    // Verify category stats
    expect(body.categoryStats).toHaveLength(1);
    expect(body.categoryStats[0].category).toBe("food"); // Route aggregation logic uses category field
  });

  it("should return 401 if unauthorized", async () => {
    // Override auth
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const req = { url: "http://localhost/api/summary" };
    const response = await GET(req as any);

    expect((response as any).status).toBe(401);
  });
});
