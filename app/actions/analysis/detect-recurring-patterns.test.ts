import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { detectRecurringPatterns } from "./detect-recurring-patterns";

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({ user: { id: "user-123" } }),
    },
  },
}));
vi.mock("@/db", () => ({ db: { select: vi.fn() } }));
vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

function makeTransaction(overrides: Record<string, unknown>) {
  return {
    id: crypto.randomUUID(),
    userId: "user-123",
    amount: 1000,
    description: "Netflix",
    storeName: "Netflix",
    date: new Date(),
    isExpense: true,
    category: "entertainment",
    ...overrides,
  };
}

describe("detectRecurringPatterns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should detect patterns with 3+ months of consistent amounts", async () => {
    const transactions = [
      makeTransaction({ amount: 1000, date: new Date("2026-01-15") }),
      makeTransaction({ amount: 1000, date: new Date("2026-02-15") }),
      makeTransaction({ amount: 1000, date: new Date("2026-03-15") }),
    ];

    let callCount = 0;
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: () => ({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve(transactions);
          return Promise.resolve([]); // no existing subs
        }),
      }),
    }));

    const result = await detectRecurringPatterns(undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toHaveLength(1);
    expect(result.data[0].storeName).toBe("Netflix");
    expect(result.data[0].averageAmount).toBe(1000);
    expect(result.data[0].occurrences).toBe(3);
  });

  it("should not detect patterns with fewer than 3 months", async () => {
    const transactions = [
      makeTransaction({ amount: 1000, date: new Date("2026-01-15") }),
      makeTransaction({ amount: 1000, date: new Date("2026-02-15") }),
    ];

    let callCount = 0;
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: () => ({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve(transactions);
          return Promise.resolve([]);
        }),
      }),
    }));

    const result = await detectRecurringPatterns(undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toHaveLength(0);
  });

  it("should exclude amounts varying more than 10%", async () => {
    const transactions = [
      makeTransaction({ amount: 1000, date: new Date("2026-01-15") }),
      makeTransaction({ amount: 1500, date: new Date("2026-02-15") }),
      makeTransaction({ amount: 800, date: new Date("2026-03-15") }),
    ];

    let callCount = 0;
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: () => ({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve(transactions);
          return Promise.resolve([]);
        }),
      }),
    }));

    const result = await detectRecurringPatterns(undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toHaveLength(0);
  });

  it("should exclude patterns already registered as subscriptions", async () => {
    const transactions = [
      makeTransaction({ amount: 1000, date: new Date("2026-01-15") }),
      makeTransaction({ amount: 1000, date: new Date("2026-02-15") }),
      makeTransaction({ amount: 1000, date: new Date("2026-03-15") }),
    ];

    let callCount = 0;
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: () => ({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve(transactions);
          return Promise.resolve([{ name: "Netflix" }]);
        }),
      }),
    }));

    const result = await detectRecurringPatterns(undefined);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toHaveLength(0);
  });
});
