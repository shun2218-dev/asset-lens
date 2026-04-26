import { describe, expect, it } from "vitest";
import { calculateCategoryBreakdown } from "./metrics";

describe("calculateCategoryBreakdown", () => {
  it("should aggregate expenses by categoryId", () => {
    const transactions = [
      {
        id: "1",
        categoryId: "cat-1",
        amount: 1000,
        isExpense: true,
      },
      {
        id: "2",
        categoryId: "cat-1",
        amount: 500,
        isExpense: true,
      },
      {
        id: "3",
        categoryId: "cat-2",
        amount: 2000,
        isExpense: true,
      },
    ] as any; // Cast as any to avoid mocking full transaction object

    const result = calculateCategoryBreakdown(transactions);

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { categoryId: "cat-1", amount: 1500 },
        { categoryId: "cat-2", amount: 2000 },
      ]),
    );
  });

  it("should ignore income", () => {
    const transactions = [
      {
        id: "1",
        categoryId: "cat-1",
        amount: 1000,
        isExpense: true,
      },
      {
        id: "2",
        categoryId: "cat-1",
        amount: 5000,
        isExpense: false, // Income
      },
    ] as any;

    const result = calculateCategoryBreakdown(transactions);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ categoryId: "cat-1", amount: 1000 });
  });

  it("should sort results by amount descending", () => {
    const transactions = [
      { categoryId: "A", amount: 1000, isExpense: true },
      { categoryId: "B", amount: 3000, isExpense: true },
      { categoryId: "C", amount: 2000, isExpense: true },
    ] as any;

    const result = calculateCategoryBreakdown(transactions);

    expect(result[0].categoryId).toBe("B");
    expect(result[1].categoryId).toBe("C");
    expect(result[2].categoryId).toBe("A");
  });
});
