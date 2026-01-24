import { describe, expect, it } from "vitest";
import { transactionSchema } from "./validators";

describe("transactionSchema", () => {
  it("should validate a valid transaction", () => {
    const validData = {
      userId: "user-123",
      amount: 1000,
      description: "Test transaction",
      category: "food",
      date: new Date(),
      isExpense: true,
    };
    const result = transactionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail if userId is missing", () => {
    const invalidData = {
      amount: 1000,
      description: "Test transaction",
      category: "food",
      date: new Date(),
      isExpense: true,
    };
    const result = transactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("userId");
    }
  });

  it("should fail if amount is not positive", () => {
    const invalidData = {
      userId: "user-123",
      amount: 0,
      description: "Test transaction",
      category: "food",
      date: new Date(),
      isExpense: true,
    };
    const result = transactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "金額は1以上で入力してください",
      );
    }
  });

  it("should fail if description is empty", () => {
    const invalidData = {
      userId: "user-123",
      amount: 1000,
      description: "",
      category: "food",
      date: new Date(),
      isExpense: true,
    };
    const result = transactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail if category is empty", () => {
    const invalidData = {
      userId: "user-123",
      amount: 1000,
      description: "Test",
      category: "",
      date: new Date(),
      isExpense: true,
    };
    const result = transactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
