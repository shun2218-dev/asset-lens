import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { deleteStore } from "./delete";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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
  resend: { emails: { send: vi.fn() } },
}));

describe("deleteStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete store without transaction references", async () => {
    // First call: ownership check (found)
    // Second call: transaction reference check (not found)
    let callCount = 0;
    (db.select as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        callCount++;
        if (callCount === 1) {
          // Ownership check - returns existing store
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi
                  .fn()
                  .mockResolvedValue([
                    { id: "store-1", name: "テスト店舗", userId: "user-123" },
                  ]),
              }),
            }),
          };
        }
        // Transaction reference check - no references
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      },
    );

    const deleteWhereMock = vi.fn().mockResolvedValue(undefined);
    (db.delete as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      where: deleteWhereMock,
    });

    const result = await deleteStore("store-1");
    expect(result.success).toBe(true);
  });

  it("should reject deletion when transactions reference the store", async () => {
    let callCount = 0;
    (db.select as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi
                  .fn()
                  .mockResolvedValue([
                    { id: "store-1", name: "テスト店舗", userId: "user-123" },
                  ]),
              }),
            }),
          };
        }
        // Transaction reference found
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: "tx-1" }]),
            }),
          }),
        };
      },
    );

    const result = await deleteStore("store-1");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("取引で使用されています");
    }
  });

  it("should reject non-existent store", async () => {
    (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const result = await deleteStore("nonexistent");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("店舗が見つかりません");
    }
  });
});
