import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createTransaction } from "./create";

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

describe("createTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = {
    userId: "user-123",
    amount: 1000,
    description: "Test",
    storeName: "テスト店舗",
    category: "cat-uuid-123",
    date: new Date("2024-01-01T00:00:00Z"),
    isExpense: true,
  };

  it("should successfully create a transaction", async () => {
    const mockCategory = { slug: "food", id: "cat-uuid-123" };

    const limitMock = vi.fn().mockResolvedValue([mockCategory]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const returningMock = vi.fn().mockResolvedValue([{ id: "tx-123" }]);
    const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createTransaction(mockData);

    expect(result.success).toBe(true);
    expect(db.select).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();

    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: "cat-uuid-123",
      }),
    );
  });

  it("should return error if category is not found", async () => {
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await createTransaction(mockData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Category not found");
    }
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    const mockCategory = { slug: "food", id: "cat-uuid-123" };
    const limitMock = vi.fn().mockResolvedValue([mockCategory]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const valuesMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createTransaction(mockData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("DB Error");
    }
  });
});
