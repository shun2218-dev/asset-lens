import { describe, expect, it, vi, beforeEach } from "vitest";
import { getTransaction } from "./get";
import { db } from "@/db";

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

describe("getTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = [
    {
      t: {
        id: "tx-1",
        amount: 1000,
        date: new Date("2024-01-01"),
        description: "Test 1",
        category: "food",
        categoryId: "cat-1",
        isExpense: true,
      },
      c: {
        id: "cat-1",
        slug: "food-slug",
        name: "Food",
      },
    },
  ];

  it("should return transactions with pagination metadata", async () => {
    // Mock Data Query Chain
    // select -> from -> leftJoin -> where -> orderBy -> limit -> offset
    const offsetMock = vi.fn().mockResolvedValue(mockData);
    const limitMock = vi.fn().mockReturnValue({ offset: offsetMock });
    const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
    const whereDataMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const leftJoinMock = vi.fn().mockReturnValue({ where: whereDataMock });
    const fromDataMock = vi.fn().mockReturnValue({ leftJoin: leftJoinMock });
    
    // Mock Count Query Chain
    // select({ count }) -> from -> where
    // This is tricky because db.select is called twice.
    // First call is for data (args provided), second for count (args provided).
    
    const whereCountMock = vi.fn().mockResolvedValue([{ count: 25 }]); // Total 25 items
    const fromCountMock = vi.fn().mockReturnValue({ where: whereCountMock });

    (db.select as any).mockImplementation((args: any) => {
        if (args && args.count) {
             return { from: fromCountMock };
        }
        return { from: fromDataMock };
    });

    const result = await getTransaction(1);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].category).toBe("food-slug"); // Should use joined category slug
    expect(result.metadata.totalCount).toBe(25);
    expect(result.metadata.totalPages).toBe(3); // 25 / 10 = 2.5 -> 3
    expect(result.metadata.hasNextPage).toBe(true);
  });

  it("should handle empty data", async () => {
    // Empty data response
    const offsetMock = vi.fn().mockResolvedValue([]);
    const limitMock = vi.fn().mockReturnValue({ offset: offsetMock });
    const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
    const whereDataMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const leftJoinMock = vi.fn().mockReturnValue({ where: whereDataMock });
    const fromDataMock = vi.fn().mockReturnValue({ leftJoin: leftJoinMock });

    // Zero count
    const whereCountMock = vi.fn().mockResolvedValue([{ count: 0 }]);
    const fromCountMock = vi.fn().mockReturnValue({ where: whereCountMock });
    
    (db.select as any).mockImplementation((args: any) => {
        if (args && args.count) {
             return { from: fromCountMock };
        }
        return { from: fromDataMock };
    });

    const result = await getTransaction(1);

    expect(result.data).toEqual([]);
    expect(result.metadata.totalCount).toBe(0);
  });

  it("should return empty structure on error", async () => {
    (db.select as any).mockImplementation(() => {
        throw new Error("DB Connection Error");
    });

    const result = await getTransaction(1);
    
    expect(result.data).toEqual([]);
    expect(result.metadata.totalCount).toBe(0);
  });
});
