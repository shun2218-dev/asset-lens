import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { deleteSavingsGoal } from "./delete";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
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

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      savingsGoal: {
        findFirst: vi.fn(),
      },
    },
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe("deleteSavingsGoal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as never);
  });

  it("should delete an existing goal", async () => {
    vi.mocked(db.query.savingsGoal.findFirst).mockResolvedValueOnce({
      id: "00000000-0000-4000-8000-000000000001",
      userId: "user-123",
      name: "旅行",
      targetAmount: 500000,
      currentAmount: 0,
      deadline: null,
      icon: "piggy-bank",
      color: "#6366f1",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await deleteSavingsGoal(
      "00000000-0000-4000-8000-000000000001",
    );
    expect(result.success).toBe(true);
  });

  it("should fail when goal not found", async () => {
    vi.mocked(db.query.savingsGoal.findFirst).mockResolvedValueOnce(undefined);

    const result = await deleteSavingsGoal(
      "00000000-0000-4000-8000-000000000099",
    );
    expect(result.success).toBe(false);
  });
});
