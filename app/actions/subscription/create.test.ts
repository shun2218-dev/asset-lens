import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createSubscription } from "./create";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "user-123" },
      }),
    },
  },
}));

// Mock db
vi.mock("@/db", () => {
  return {
    db: {
      insert: vi.fn(),
    },
  };
});

// Mock mail client
vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe("createSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = {
    name: "Netflix",
    amount: 1500,
    currency: "JPY",
    billingCycle: "monthly" as const,
    nextPaymentDate: new Date("2024-02-01"),
    category: "entertainment",
    serviceId: "netflix", // Assuming validation allows extra fields or ignores them
  };

  it("should successfully create a subscription", async () => {
    // Mock db.insert chain
    const valuesMock = vi.fn().mockResolvedValue([{ id: "sub-123" }]);
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createSubscription(mockData);

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Netflix",
        amount: 1500,
        userId: "user-123",
        category: "entertainment",
      }),
    );
  });

  it("should throw error if unauthorized", async () => {
    // Override auth mock to return null
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await createSubscription(mockData); // Action returns { success: false, ... } not throw generally

    expect(result.success).toBe(false);
    expect(result.error).toBe("ログインしてください");
  });

  it("should fail validation if name is empty", async () => {
    const invalidData = { ...mockData, name: "" };
    const result = await createSubscription(invalidData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("サービス名を入力してください");
  });

  it("should handle database errors gracefully", async () => {
    // Mock insert failure
    const valuesMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createSubscription(mockData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("サブスクリプションの追加に失敗しました");
  });
});
