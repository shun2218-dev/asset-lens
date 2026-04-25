import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getMonthlyDailySummary } from "./get-daily-summary";

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

describe("getMonthlyDailySummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDailyData = [
    { date: "2024-01-05", income: 0, expense: 1500, count: 2 },
    { date: "2024-01-15", income: 200000, expense: 0, count: 1 },
    { date: "2024-01-20", income: 0, expense: 3000, count: 3 },
  ];

  function setupDbMock(data: typeof mockDailyData) {
    const orderByMock = vi.fn().mockResolvedValue(data);
    const groupByMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const whereMock = vi.fn().mockReturnValue({ groupBy: groupByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
      from: fromMock,
    });
    return { fromMock, whereMock, groupByMock, orderByMock };
  }

  it("should return daily summaries for a given month", async () => {
    setupDbMock(mockDailyData);

    const result = await getMonthlyDailySummary("2024-01");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(3);
      expect(result.data[0].date).toBe("2024-01-05");
      expect(result.data[0].expense).toBe(1500);
      expect(result.data[1].income).toBe(200000);
      expect(result.data[2].count).toBe(3);
    }
  });

  it("should return empty array when no transactions in month", async () => {
    setupDbMock([]);

    const result = await getMonthlyDailySummary("2024-06");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it("should call db.select with correct query structure", async () => {
    const { fromMock, whereMock } = setupDbMock(mockDailyData);

    await getMonthlyDailySummary("2024-01");

    expect(db.select).toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalled();
    expect(whereMock).toHaveBeenCalled();
  });

  it("should return error result when DB throws", async () => {
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("DB Connection Error");
    });

    const result = await getMonthlyDailySummary("2024-01");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("DB Connection Error");
    }
  });

  it("should return auth error when session is null", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

    const result = await getMonthlyDailySummary("2024-01");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Please sign in to continue");
    }
  });
});
