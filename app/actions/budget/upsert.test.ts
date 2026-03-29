import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { upsertBudget } from "./upsert";

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
    query: {
      budget: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("upsertBudget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new overall budget", async () => {
    (db.query.budget.findFirst as any).mockResolvedValue(null);
    const valuesMock = vi.fn().mockResolvedValue([]);
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await upsertBudget({ categoryId: null, amount: 200000 });

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();
  });

  it("should update an existing budget", async () => {
    (db.query.budget.findFirst as any).mockResolvedValue({
      id: "budget-1",
      amount: 100000,
    });
    const whereMock = vi.fn().mockResolvedValue([]);
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await upsertBudget({ categoryId: null, amount: 200000 });

    expect(result.success).toBe(true);
    expect(db.update).toHaveBeenCalled();
  });

  it("should reject zero or negative amounts", async () => {
    const result = await upsertBudget({ categoryId: null, amount: 0 });

    expect(result.success).toBe(false);
    expect(result.error).toContain("1円以上");
  });

  it("should return error if not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await upsertBudget({ categoryId: null, amount: 200000 });

    expect(result.success).toBe(false);
    expect(result.error).toBe("ログインしてください");
  });
});
