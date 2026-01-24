import { describe, expect, it, vi, beforeEach } from "vitest";
import { deleteTransaction } from "./delete";
import { db } from "@/db";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock db
vi.mock("@/db", () => {
  return {
    db: {
      delete: vi.fn(),
    },
  };
});

describe("deleteTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const transactionId = "tx-123";

  it("should successfully delete a transaction", async () => {
    // Mock db.delete chain
    const whereMock = vi.fn().mockResolvedValue([{ id: transactionId }]);
    (db.delete as any).mockReturnValue({ where: whereMock });

    const result = await deleteTransaction(transactionId);

    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalled();
    expect(whereMock).toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    // Mock delete failure
    const whereMock = vi.fn().mockImplementation(() => {
        throw new Error("DB Error");
    });
    (db.delete as any).mockReturnValue({ where: whereMock });

    const result = await deleteTransaction(transactionId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("削除に失敗しました");
  });
});
