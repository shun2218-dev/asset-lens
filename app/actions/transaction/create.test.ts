import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createTransaction } from "./create";

// import { category, transaction } from "@/db/schema"; // We might need to mock these or use them as is if they are just objects

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

// Mock mail client to avoid init error
vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe("createTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = {
    userId: "user-123",
    amount: 1000,
    description: "Test",
    category: "cat-uuid-123",
    date: new Date("2024-01-01T00:00:00Z"),
    isExpense: true,
  };

  it("should successfully create a transaction", async () => {
    // Mock category lookup
    const mockCategory = { slug: "food", id: "cat-uuid-123" };

    // Mock the chain: db.select().from().where().limit()
    const limitMock = vi.fn().mockResolvedValue([mockCategory]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    // Mock the chain: db.insert().values().returning()
    const returningMock = vi.fn().mockResolvedValue([{ id: "tx-123" }]);
    const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createTransaction(mockData);

    expect(result.success).toBe(true);
    expect(db.select).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();

    // Check if category slug was correctly retrieved and used
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "food",
        categoryId: "cat-uuid-123",
      }),
    );
  });

  it("should return error if category is not found", async () => {
    // Mock category lookup returning empty
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await createTransaction(mockData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("カテゴリが見つかりません");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    // Mock category lookup success
    const mockCategory = { slug: "food", id: "cat-uuid-123" };
    const limitMock = vi.fn().mockResolvedValue([mockCategory]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    // Mock insert failure
    const valuesMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createTransaction(mockData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("データの追加に失敗しました");
  });
});
