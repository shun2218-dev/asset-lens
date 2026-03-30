import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createStore } from "./create";

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

describe("createStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new store", async () => {
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const returningMock = vi.fn().mockResolvedValue([{ id: "new-store-id" }]);
    const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createStore("テスト店舗");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("new-store-id");
    }
  });

  it("should return existing store if duplicate", async () => {
    const limitMock = vi
      .fn()
      .mockResolvedValue([{ id: "existing-store-id", name: "テスト店舗" }]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await createStore("テスト店舗");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("existing-store-id");
    }
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("should return error for empty name", async () => {
    const result = await createStore("");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Store name is required");
    }
  });

  it("should handle database errors", async () => {
    (db.select as any).mockImplementation(() => {
      throw new Error("DB Error");
    });

    const result = await createStore("テスト");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("DB Error");
    }
  });
});
