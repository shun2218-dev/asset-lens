import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { depositToGoal } from "./deposit";

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
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

const GOAL_ID = "00000000-0000-4000-8000-000000000001";

const mockGoal = {
  id: GOAL_ID,
  userId: "user-123",
  name: "旅行資金",
  targetAmount: 100000,
  currentAmount: 50000,
  deadline: null,
  icon: "piggy-bank",
  color: "#6366f1",
  status: "active" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("depositToGoal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.update).mockImplementation(
      () =>
        ({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }) as never,
    );
  });

  it("should deposit and return new amount", async () => {
    vi.mocked(db.query.savingsGoal.findFirst).mockResolvedValueOnce(mockGoal);

    const result = await depositToGoal({ goalId: GOAL_ID, amount: 10000 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.newAmount).toBe(60000);
      expect(result.data.completed).toBe(false);
    }
  });

  it("should mark as completed when target is reached", async () => {
    vi.mocked(db.query.savingsGoal.findFirst).mockResolvedValueOnce(mockGoal);

    const result = await depositToGoal({ goalId: GOAL_ID, amount: 50000 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.newAmount).toBe(100000);
      expect(result.data.completed).toBe(true);
    }
  });

  it("should mark as completed when target is exceeded", async () => {
    vi.mocked(db.query.savingsGoal.findFirst).mockResolvedValueOnce(mockGoal);

    const result = await depositToGoal({ goalId: GOAL_ID, amount: 60000 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(true);
    }
  });

  it("should reject deposit to non-active goal", async () => {
    vi.mocked(db.query.savingsGoal.findFirst).mockResolvedValueOnce({
      ...mockGoal,
      status: "completed",
    });

    const result = await depositToGoal({ goalId: GOAL_ID, amount: 10000 });
    expect(result.success).toBe(false);
  });

  it("should reject zero amount", async () => {
    const result = await depositToGoal({ goalId: GOAL_ID, amount: 0 });
    expect(result.success).toBe(false);
  });

  it("should fail when goal not found", async () => {
    vi.mocked(db.query.savingsGoal.findFirst).mockResolvedValueOnce(undefined);

    const result = await depositToGoal({
      goalId: "00000000-0000-4000-8000-000000000099",
      amount: 10000,
    });
    expect(result.success).toBe(false);
  });
});
