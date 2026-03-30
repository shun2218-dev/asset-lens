import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createBulkTransaction } from "./create-bulk";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

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
      insert: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
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
    const limitMock = vi.fn();
    limitMock
      .mockResolvedValueOnce([{ slug: "food", id: "cat-uuid-1" }])
      .mockResolvedValueOnce([{ slug: "salary", id: "cat-uuid-2" }]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const valuesMock = vi.fn().mockResolvedValue([]);
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createBulkTransaction(mockData);

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();

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
    const limitMock = vi.fn();
    limitMock
      .mockResolvedValueOnce([{ slug: "food", id: "cat-uuid-1" }])
      .mockResolvedValueOnce([]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await createBulkTransaction(mockData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Category not found");
    }
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
    const limitMock = vi
      .fn()
      .mockResolvedValue([{ slug: "food", id: "cat-uuid-1" }]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

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
    if (!result.success) {
      expect(result.error).toBe("DB Error");
    }
  });
});
