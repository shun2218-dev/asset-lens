import type { Meta, StoryObj } from "@storybook/react";
import { BudgetProgress } from "./budget-progress";

const meta: Meta<typeof BudgetProgress> = {
  title: "Features/Dashboard/Widgets/BudgetProgress",
  component: BudgetProgress,
};

export default meta;
type Story = StoryObj<typeof BudgetProgress>;

export const WithBudgets: Story = {
  args: {
    budgets: [
      {
        id: "b1",
        userId: "user1",
        categoryId: null,
        amount: 200000,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "b2",
        userId: "user1",
        categoryId: "cat1",
        amount: 50000,
        category: {
          id: "cat1",
          name: "食費",
          slug: "food",
          type: "expense",
          userId: "user1",
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "b3",
        userId: "user1",
        categoryId: "cat2",
        amount: 15000,
        category: {
          id: "cat2",
          name: "交際費",
          slug: "social",
          type: "expense",
          userId: "user1",
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    totalExpense: 145000,
    categoryExpenses: [
      { categoryId: "cat1", amount: 42000 },
      { categoryId: "cat2", amount: 14000 },
    ],
  },
};

export const OverBudget: Story = {
  args: {
    budgets: [
      {
        id: "b1",
        userId: "user1",
        categoryId: null,
        amount: 100000,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    totalExpense: 120000,
    categoryExpenses: [],
  },
};

export const Empty: Story = {
  args: {
    budgets: [],
    totalExpense: 50000,
    categoryExpenses: [],
  },
};
