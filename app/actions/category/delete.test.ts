import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { deleteCategory } from "./delete";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
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
      delete: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe("deleteCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully delete a category with no transactions", async () => {
    // Mock select chain - no linked transactions
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    // Mock delete chain
    const deleteWhereMock = vi.fn().mockResolvedValue([]);
    (db.delete as any).mockReturnValue({ where: deleteWhereMock });

    const result = await deleteCategory("cat-123");

    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalled();
  });

  it("should prevent deletion if transactions exist", async () => {
    // Mock select chain - has linked transactions
    const limitMock = vi.fn().mockResolvedValue([{ id: "tx-1" }]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await deleteCategory("cat-123");

    expect(result.success).toBe(false);
    expect(result.error).toContain("紐づく取引がある");
    expect(db.delete).not.toHaveBeenCalled();
  });

  it("should throw error if unauthorized", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    await expect(deleteCategory("cat-123")).rejects.toThrow("Unauthorized");
  });

  it("should return error on database failure", async () => {
    // Mock select failure
    const fromMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await deleteCategory("cat-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("カテゴリの削除に失敗しました");
  });
});
