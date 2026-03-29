import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { updateSubscription } from "./update";

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
    update: vi.fn(),
  },
}));

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("updateSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validData = {
    name: "Netflix",
    amount: 1490,
    currency: "JPY",
    billingCycle: "monthly" as const,
    nextPaymentDate: new Date("2024-04-15"),
    category: "subscription",
  };

  it("should successfully update a subscription", async () => {
    const whereMock = vi.fn().mockResolvedValue([]);
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await updateSubscription("sub-123", validData);

    expect(result.success).toBe(true);
    expect(db.update).toHaveBeenCalled();
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Netflix",
        amount: 1490,
      }),
    );
  });

  it("should return error if not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await updateSubscription("sub-123", validData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("ログインしてください");
  });

  it("should fail validation with empty name", async () => {
    const invalidData = { ...validData, name: "" };
    const result = await updateSubscription("sub-123", invalidData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle database errors gracefully", async () => {
    const whereMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await updateSubscription("sub-123", validData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("サブスクリプションの更新に失敗しました");
  });
});
