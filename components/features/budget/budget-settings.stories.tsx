import type { Meta, StoryObj } from "@storybook/react";
import { BudgetSettings } from "./budget-settings";

const meta: Meta<typeof BudgetSettings> = {
  title: "Features/Budget/BudgetSettings",
  component: BudgetSettings,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Budget management interface for setting monthly overall and per-category budget limits. Supports inline editing and delete confirmation dialogs.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BudgetSettings>;

const mockCategories = [
  {
    id: "c1",
    name: "食費",
    slug: "food",
    type: "expense" as const,
    icon: null,
    color: null,
    userId: "user1",
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c2",
    name: "交通費",
    slug: "transport",
    type: "expense" as const,
    icon: null,
    color: null,
    userId: "user1",
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c3",
    name: "交際費",
    slug: "social",
    type: "expense" as const,
    icon: null,
    color: null,
    userId: "user1",
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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
        categoryId: "c1",
        amount: 50000,
        category: mockCategories[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    categories: mockCategories,
  },
};

export const Empty: Story = {
  args: {
    budgets: [],
    categories: mockCategories,
  },
};
