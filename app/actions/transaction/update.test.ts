import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { updateTransaction } from "./update";

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
      update: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("updateTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const transactionId = "tx-123";
  const mockData = {
    userId: "user-123",
    amount: 2000,
    description: "Updated Transaction",
    storeName: "更新店舗",
    category: "cat-uuid-456",
    date: new Date("2024-01-02T00:00:00Z"),
    isExpense: true,
  };

  it("should successfully update a transaction", async () => {
    const mockCategory = { slug: "transport", id: "cat-uuid-456" };

    const limitMock = vi.fn().mockResolvedValue([mockCategory]);
    const whereSelectMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereSelectMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const whereUpdateMock = vi.fn().mockResolvedValue([{ id: transactionId }]);
    const setMock = vi.fn().mockReturnValue({ where: whereUpdateMock });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await updateTransaction({
      id: transactionId,
      data: mockData,
    });

    expect(result.success).toBe(true);
    expect(db.select).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();

    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 2000,
        description: "Updated Transaction",
        categoryId: "cat-uuid-456",
        date: mockData.date,
      }),
    );
  });

  it("should return error if category is not found", async () => {
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereSelectMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereSelectMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await updateTransaction({
      id: transactionId,
      data: mockData,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Category not found");
    }
    expect(db.update).not.toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    const mockCategory = { slug: "transport", id: "cat-uuid-456" };
    const limitMock = vi.fn().mockResolvedValue([mockCategory]);
    const whereSelectMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereSelectMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const setMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await updateTransaction({
      id: transactionId,
      data: mockData,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("DB Error");
    }
  });
});
