import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import {
  applyStoreNameMigration,
  getTransactionsWithoutStore,
} from "./migrate-store";

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

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("getTransactionsWithoutStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transactions without store name", async () => {
    const mockRows = [
      {
        id: "tx-1",
        description: "ファミマ おにぎり",
        storeName: null,
        date: new Date(),
        amount: 300,
        category: "food",
      },
    ];
    const orderByMock = vi.fn().mockResolvedValue(mockRows);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await getTransactionsWithoutStore();

    expect(result).toEqual(mockRows);
  });

  it("should return empty array if not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await getTransactionsWithoutStore();

    expect(result).toEqual([]);
  });
});

describe("applyStoreNameMigration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update transactions with store names", async () => {
    const whereMock = vi.fn().mockResolvedValue([]);
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.update as any).mockReturnValue({ set: setMock });

    const updates = [
      { id: "tx-1", storeName: "ファミマ", description: "おにぎり" },
      { id: "tx-2", storeName: "スタバ", description: "ラテ" },
    ];

    const result = await applyStoreNameMigration(updates);

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(2);
    expect(db.update).toHaveBeenCalledTimes(2);
  });

  it("should return error if not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await applyStoreNameMigration([]);

    expect(result.success).toBe(false);
    expect(result.error).toBe("認証されていません");
  });

  it("should handle database errors", async () => {
    const setMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await applyStoreNameMigration([
      { id: "tx-1", storeName: "Test", description: "desc" },
    ]);

    expect(result.success).toBe(false);
    expect(result.error).toBe("更新に失敗しました");
  });
});
