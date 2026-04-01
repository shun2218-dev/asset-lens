import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getTransaction } from "./get";

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

  it("should return transactions with pagination metadata using input object", async () => {
    // Mock Data Query Chain
    const offsetMock = vi.fn().mockResolvedValue(mockData);
    const limitMock = vi.fn().mockReturnValue({ offset: offsetMock });
    const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
    const whereDataMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const leftJoinMock = vi.fn().mockReturnValue({ where: whereDataMock });
    const fromDataMock = vi.fn().mockReturnValue({ leftJoin: leftJoinMock });

    // Mock Count Query Chain
    const whereCountMock = vi.fn().mockResolvedValue([{ count: 25 }]);
    const fromCountMock = vi.fn().mockReturnValue({ where: whereCountMock });

    (db.select as any).mockImplementation((args: any) => {
      if (args && args.count) {
        return { from: fromCountMock };
      }
      return { from: fromDataMock };
    });

    const result = await getTransaction({ page: 1 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].category).toBe("food-slug");
      expect(result.data.metadata.totalCount).toBe(25);
      expect(result.data.metadata.totalPages).toBe(3);
      expect(result.data.metadata.hasNextPage).toBe(true);
    }
  });

  it("should handle empty data", async () => {
    const offsetMock = vi.fn().mockResolvedValue([]);
    const limitMock = vi.fn().mockReturnValue({ offset: offsetMock });
    const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
    const whereDataMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const leftJoinMock = vi.fn().mockReturnValue({ where: whereDataMock });
    const fromDataMock = vi.fn().mockReturnValue({ leftJoin: leftJoinMock });

    const whereCountMock = vi.fn().mockResolvedValue([{ count: 0 }]);
    const fromCountMock = vi.fn().mockReturnValue({ where: whereCountMock });

    (db.select as any).mockImplementation((args: any) => {
      if (args && args.count) {
        return { from: fromCountMock };
      }
      return { from: fromDataMock };
    });

    const result = await getTransaction({ page: 1 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toEqual([]);
      expect(result.data.metadata.totalCount).toBe(0);
    }
  });

  it("should accept filter and sort parameters via input object", async () => {
    const offsetMock = vi.fn().mockResolvedValue(mockData);
    const limitMock = vi.fn().mockReturnValue({ offset: offsetMock });
    const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
    const whereDataMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const leftJoinMock = vi.fn().mockReturnValue({ where: whereDataMock });
    const fromDataMock = vi.fn().mockReturnValue({ leftJoin: leftJoinMock });

    const whereCountMock = vi.fn().mockResolvedValue([{ count: 1 }]);
    const fromCountMock = vi.fn().mockReturnValue({ where: whereCountMock });

    (db.select as any).mockImplementation((args: any) => {
      if (args && args.count) {
        return { from: fromCountMock };
      }
      return { from: fromDataMock };
    });

    const result = await getTransaction({
      page: 1,
      filters: {
        categoryId: "cat-1",
        searchQuery: "Test",
      },
      sort: {
        sortBy: "date",
        sortOrder: "asc",
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toHaveLength(1);
    }
    expect(db.select).toHaveBeenCalled();
  });

  it("should return error result when DB throws", async () => {
    (db.select as any).mockImplementation(() => {
      throw new Error("DB Connection Error");
    });

    const result = await getTransaction({ page: 1 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("DB Connection Error");
    }
  });

  it("should return auth error when session is null", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any);

    const result = await getTransaction({ page: 1 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Please sign in to continue");
    }
  });
});
