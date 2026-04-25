import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock BudgetRing (uses requestAnimationFrame which is complex in tests)
vi.mock("@/components/features/dashboard/widgets/budget-ring", () => ({
  BudgetRing: () => <div data-testid="budget-ring" />,
}));

import { BudgetProgress } from "./budget-progress";

const mockBudgets = [
  {
    id: "b-overall",
    userId: "user1",
    categoryId: null,
    amount: 200000,
    category: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "b-food",
    userId: "user1",
    categoryId: "cat-1",
    amount: 50000,
    category: {
      id: "cat-1",
      name: "食費",
      slug: "food",
      type: "expense" as const,
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
      sortOrder: 1,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("Budget threshold logic", () => {
  it("should show no alert badge when under 50%", () => {
    render(
      <BudgetProgress
        budgets={mockBudgets}
        totalExpense={50000} // 25% of 200000
        categoryExpenses={[{ categoryId: "cat-1", amount: 20000 }]} // 40% of 50000
      />,
    );

    // No alert badges should be present
    expect(screen.queryByText("超過")).toBe(null);
    expect(screen.queryByText("注意")).toBe(null);
    expect(screen.queryByText("50%超")).toBe(null);
  });

  it("should show '50%超' badge when between 50-80%", () => {
    render(
      <BudgetProgress
        budgets={mockBudgets}
        totalExpense={120000} // 60% of 200000
        categoryExpenses={[{ categoryId: "cat-1", amount: 30000 }]} // 60% of 50000
      />,
    );

    // Should have warning badges
    const badges = screen.getAllByText("50%超");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("should show '注意' badge when between 80-100%", () => {
    render(
      <BudgetProgress
        budgets={mockBudgets}
        totalExpense={180000} // 90% of 200000
        categoryExpenses={[{ categoryId: "cat-1", amount: 45000 }]} // 90% of 50000
      />,
    );

    const badges = screen.getAllByText("注意");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("should show '超過' badge when over 100%", () => {
    render(
      <BudgetProgress
        budgets={mockBudgets}
        totalExpense={250000} // 125% of 200000
        categoryExpenses={[{ categoryId: "cat-1", amount: 60000 }]} // 120% of 50000
      />,
    );

    const badges = screen.getAllByText("超過");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("should show exceeded alert banner", () => {
    render(
      <BudgetProgress
        budgets={mockBudgets}
        totalExpense={250000}
        categoryExpenses={[{ categoryId: "cat-1", amount: 60000 }]}
      />,
    );

    expect(screen.getAllByText("予算超過").length).toBeGreaterThan(0);
  });

  it("should show danger alert banner at 80%+", () => {
    render(
      <BudgetProgress
        budgets={mockBudgets}
        totalExpense={180000}
        categoryExpenses={[{ categoryId: "cat-1", amount: 20000 }]}
      />,
    );

    expect(screen.getAllByText("予算に近づいています").length).toBeGreaterThan(
      0,
    );
  });

  it("should show empty state when no budgets", () => {
    render(
      <BudgetProgress budgets={[]} totalExpense={0} categoryExpenses={[]} />,
    );

    expect(screen.getByText("まだ予算が設定されていません")).toBeDefined();
  });

  it("should fire toast on exceeded threshold", async () => {
    const { toast } = await import("sonner");

    render(
      <BudgetProgress
        budgets={mockBudgets}
        totalExpense={250000}
        categoryExpenses={[{ categoryId: "cat-1", amount: 60000 }]}
      />,
    );

    expect(toast.error).toHaveBeenCalledWith("予算超過", expect.any(Object));
  });
});
