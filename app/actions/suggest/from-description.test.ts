import { describe, expect, it, vi } from "vitest";

const mockDb = {
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  groupBy: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
};

vi.mock("@/db", () => ({
  db: {
    select: () => {
      mockDb.select();
      return {
        from: () => {
          mockDb.from();
          return {
            where: () => {
              mockDb.where();
              return {
                groupBy: () => {
                  mockDb.groupBy();
                  return {
                    orderBy: () => {
                      mockDb.orderBy();
                      return {
                        limit: () => {
                          mockDb.limit();
                          return Promise.resolve([
                            {
                              category: "food",
                              storeName: "Lawson",
                              count: 5,
                            },
                            {
                              category: "food",
                              storeName: "FamilyMart",
                              count: 3,
                            },
                            {
                              category: "daily",
                              storeName: "Lawson",
                              count: 2,
                            },
                          ]);
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  },
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

vi.mock("next/headers", () => ({
  headers: vi
    .fn()
    .mockResolvedValue(new Map([["x-correlation-id", "test-id"]])),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("suggestFromDescription", () => {
  it("should return empty results for short descriptions", async () => {
    const { suggestFromDescription } = await import("./from-description");
    const result = await suggestFromDescription("a");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categories).toEqual([]);
      expect(result.data.storeName).toBeNull();
    }
  });

  it("should aggregate categories and find top store", async () => {
    const { suggestFromDescription } = await import("./from-description");
    const result = await suggestFromDescription("コンビニ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categories).toHaveLength(2);
      expect(result.data.categories[0]).toEqual({
        category: "food",
        count: 8,
      });
      expect(result.data.categories[1]).toEqual({
        category: "daily",
        count: 2,
      });
      expect(result.data.storeName).toBe("Lawson");
    }
  });

  it("should limit categories to 5 results", async () => {
    const { suggestFromDescription } = await import("./from-description");
    const result = await suggestFromDescription("test");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categories.length).toBeLessThanOrEqual(5);
    }
  });
});
