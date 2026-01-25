import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { updateTransaction } from "./update";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock db
vi.mock("@/db", () => {
  return {
    db: {
      select: vi.fn(),
      update: vi.fn(),
    },
  };
});

describe("updateTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const transactionId = "tx-123";
  const mockData = {
    userId: "user-123",
    amount: 2000,
    description: "Updated Transaction",
    category: "cat-uuid-456",
    date: new Date("2024-01-02T00:00:00Z"),
    isExpense: true,
  };

  it("should successfully update a transaction", async () => {
    // Mock category lookup
    const mockCategory = { slug: "transport", id: "cat-uuid-456" };

    // Mock db.select chain
    const limitMock = vi.fn().mockResolvedValue([mockCategory]);
    const whereSelectMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereSelectMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    // Mock db.update chain
    const whereUpdateMock = vi.fn().mockResolvedValue([{ id: transactionId }]);
    const setMock = vi.fn().mockReturnValue({ where: whereUpdateMock });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await updateTransaction(transactionId, mockData);

    expect(result.success).toBe(true);
    expect(db.select).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();

    // Verify update values
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 2000,
        description: "Updated Transaction",
        category: "transport", // Legacy slug
        categoryId: "cat-uuid-456",
        date: mockData.date,
      }),
    );
  });

  it("should return error if category is not found", async () => {
    // Mock category lookup returning empty
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereSelectMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereSelectMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await updateTransaction(transactionId, mockData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("カテゴリが見つかりません");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    // Mock category lookup success
    const mockCategory = { slug: "transport", id: "cat-uuid-456" };
    const limitMock = vi.fn().mockResolvedValue([mockCategory]);
    const whereSelectMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereSelectMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    // Mock update failure
    const setMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await updateTransaction(transactionId, mockData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("更新に失敗しました");
  });
});
