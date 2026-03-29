import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createBulkTransaction } from "./create-bulk";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

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
      insert: vi.fn(),
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

describe("createBulkTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = {
    userId: "user-123",
    date: new Date("2024-01-01T00:00:00Z"),
    entries: [
      {
        amount: 1000,
        description: "Lunch",
        category: "cat-uuid-1",
        isExpense: true,
      },
      {
        amount: 2000,
        description: "Dinner",
        category: "cat-uuid-1",
        isExpense: true,
      },
      {
        amount: 50000,
        description: "Part-time work",
        category: "cat-uuid-2",
        isExpense: false,
      },
    ],
  };

  it("should successfully create multiple transactions", async () => {
    // Mock category lookups
    const limitMock = vi.fn();
    limitMock
      .mockResolvedValueOnce([{ slug: "food", id: "cat-uuid-1" }])
      .mockResolvedValueOnce([{ slug: "salary", id: "cat-uuid-2" }]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    // Mock insert
    const valuesMock = vi.fn().mockResolvedValue([]);
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createBulkTransaction(mockData);

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();

    // Should insert 3 records
    expect(valuesMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          amount: 1000,
          description: "Lunch",
          category: "food",
        }),
        expect.objectContaining({
          amount: 2000,
          description: "Dinner",
          category: "food",
        }),
        expect.objectContaining({
          amount: 50000,
          description: "Part-time work",
          category: "salary",
        }),
      ]),
    );
  });

  it("should return error if a category is not found", async () => {
    // First category found, second not
    const limitMock = vi.fn();
    limitMock
      .mockResolvedValueOnce([{ slug: "food", id: "cat-uuid-1" }])
      .mockResolvedValueOnce([]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await createBulkTransaction(mockData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("カテゴリが見つかりません");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("should return error for empty entries", async () => {
    const result = await createBulkTransaction({
      userId: "user-123",
      date: new Date("2024-01-01T00:00:00Z"),
      entries: [],
    });

    expect(result.success).toBe(false);
  });

  it("should handle database errors gracefully", async () => {
    // Mock category lookup success
    const limitMock = vi
      .fn()
      .mockResolvedValue([{ slug: "food", id: "cat-uuid-1" }]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    // Mock insert failure
    const valuesMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createBulkTransaction({
      userId: "user-123",
      date: new Date("2024-01-01T00:00:00Z"),
      entries: [
        {
          amount: 1000,
          description: "Test",
          category: "cat-uuid-1",
          isExpense: true,
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("一括登録に失敗しました");
  });
});
