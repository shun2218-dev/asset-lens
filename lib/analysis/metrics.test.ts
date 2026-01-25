import { describe, expect, it } from "vitest";
import { calculateCategoryBreakdown } from "./metrics";

describe("calculateCategoryBreakdown", () => {
  it("should aggregate expenses by categoryId", () => {
    const transactions = [
      {
        id: "1",
        categoryId: "cat-1",
        category: "food",
        amount: 1000,
        isExpense: true,
      },
      {
        id: "2",
        categoryId: "cat-1",
        category: "food",
        amount: 500,
        isExpense: true,
      },
      {
        id: "3",
        categoryId: "cat-2",
        category: "transport",
        amount: 2000,
        isExpense: true,
      },
    ] as any; // Cast as any to avoid mocking full transaction object

    const result = calculateCategoryBreakdown(transactions);

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { category: "cat-1", amount: 1500 },
        { category: "cat-2", amount: 2000 },
      ])
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
    expect(result[0]).toEqual({ category: "cat-1", amount: 1000 });
  });

  it("should fallback to category slug if categoryId is missing", () => {
    const transactions = [
      {
        id: "1",
        categoryId: null,
        category: "legacy-cat",
        amount: 1000,
        isExpense: true,
      },
      {
        id: "2",
        categoryId: "cat-new",
        category: "new-cat",
        amount: 2000,
        isExpense: true,
      },
    ] as any;

    const result = calculateCategoryBreakdown(transactions);

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { category: "legacy-cat", amount: 1000 },
        { category: "cat-new", amount: 2000 },
      ])
    );
  });

  it("should sort results by amount descending", () => {
    const transactions = [
      { categoryId: "A", amount: 1000, isExpense: true },
      { categoryId: "B", amount: 3000, isExpense: true },
      { categoryId: "C", amount: 2000, isExpense: true },
    ] as any;

    const result = calculateCategoryBreakdown(transactions);

    expect(result[0].category).toBe("B");
    expect(result[1].category).toBe("C");
    expect(result[2].category).toBe("A");
  });
});
