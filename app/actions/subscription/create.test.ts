import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createSubscription } from "./create";

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
      insert: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
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
    serviceId: "netflix",
  };

  it("should successfully create a subscription", async () => {
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

  it("should successfully create a subscription with 'subscription' category", async () => {
    const subscriptionData = {
      ...mockData,
      category: "subscription",
    };

    const valuesMock = vi.fn().mockResolvedValue([{ id: "sub-124" }]);
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createSubscription(subscriptionData);

    expect(result.success).toBe(true);
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "subscription",
      }),
    );
  });

  it("should return error if unauthorized", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await createSubscription(mockData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Please sign in to continue");
    }
  });

  it("should fail validation if name is empty", async () => {
    const invalidData = { ...mockData, name: "" };
    const result = await createSubscription(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("should handle database errors gracefully", async () => {
    const valuesMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createSubscription(mockData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("DB Error");
    }
  });
});
