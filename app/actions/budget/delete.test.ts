import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { deleteBudget } from "./delete";

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
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("deleteBudget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully delete a budget", async () => {
    const whereMock = vi.fn().mockResolvedValue([]);
    (db.delete as any).mockReturnValue({ where: whereMock });

    const result = await deleteBudget("budget-123");

    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalled();
  });

  it("should return error if not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await deleteBudget("budget-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("ログインしてください");
  });

  it("should handle database errors gracefully", async () => {
    const whereMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.delete as any).mockReturnValue({ where: whereMock });

    const result = await deleteBudget("budget-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("予算の削除に失敗しました");
  });
});
