import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createSavingsGoal } from "./create";

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
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe("createSavingsGoal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a savings goal with valid input", async () => {
    const result = await createSavingsGoal({
      name: "旅行資金",
      targetAmount: 500000,
    });

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();
  });

  it("should reject empty name", async () => {
    const result = await createSavingsGoal({
      name: "",
      targetAmount: 500000,
    });

    expect(result.success).toBe(false);
    expect(result).toHaveProperty("error");
  });

  it("should reject zero target amount", async () => {
    const result = await createSavingsGoal({
      name: "貯金",
      targetAmount: 0,
    });

    expect(result.success).toBe(false);
  });

  it("should reject past deadline", async () => {
    const result = await createSavingsGoal({
      name: "貯金",
      targetAmount: 100000,
      deadline: new Date("2020-01-01"),
    });

    expect(result.success).toBe(false);
  });

  it("should accept optional icon and color", async () => {
    const result = await createSavingsGoal({
      name: "緊急用",
      targetAmount: 1000000,
      icon: "shield",
      color: "#ef4444",
    });

    expect(result.success).toBe(true);
  });
});
