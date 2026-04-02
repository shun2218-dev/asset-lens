import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => {
  // biome-ignore lint/suspicious/noThenProperty: required for thenable proxy
  const thenable = { then: (r: (v: unknown[]) => void) => r([]) };
  const chain = () =>
    new Proxy(thenable, {
      get: (_t, prop) => {
        if (prop === "then") return thenable.then;
        return (..._a: unknown[]) => chain();
      },
    });
  return { db: chain() };
});

vi.mock("@/db/schema", () => ({
  transaction: { id: "id", userId: "user_id" },
  dismissedDuplicate: {
    transactionId1: "transaction_id_1",
    transactionId2: "transaction_id_2",
    userId: "user_id",
  },
}));

vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
}));

vi.mock("@/lib/actions/safe-action", () => ({
  createSafeAction: (
    handler: (input: unknown, userId: string) => Promise<unknown>,
  ) => {
    return async (input: unknown) => {
      try {
        const result = await handler(input, "user-123");
        return { success: true, data: result };
      } catch {
        return { success: false, error: "error" };
      }
    };
  },
}));

describe("duplicate detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export getDuplicates", async () => {
    const { getDuplicates } = await import("./index");
    expect(getDuplicates).toBeDefined();
    expect(typeof getDuplicates).toBe("function");
  });

  it("should export mergeDuplicates", async () => {
    const { mergeDuplicates } = await import("./index");
    expect(mergeDuplicates).toBeDefined();
    expect(typeof mergeDuplicates).toBe("function");
  });

  it("should export dismissDuplicate", async () => {
    const { dismissDuplicate } = await import("./index");
    expect(dismissDuplicate).toBeDefined();
    expect(typeof dismissDuplicate).toBe("function");
  });
});
