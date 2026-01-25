import type { Meta, StoryObj } from "@storybook/react";
import { DashboardView } from "./dashboard-view";

const meta: Meta<typeof DashboardView> = {
  title: "Features/Dashboard/DashboardView",
  component: DashboardView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DashboardView>;

const mockCategories = [
  {
    id: "1",
    name: "Food",
    slug: "food",
    type: "expense" as const,
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 1,
  },
  {
    id: "2",
    name: "Salary",
    slug: "salary",
    type: "income" as const,
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 2,
  },
  {
    id: "3",
    name: "Transport",
    slug: "transport",
    type: "expense" as const,
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 3,
  },
];

const mockTransactions = [
  {
    id: "t1",
    amount: 1200,
    description: "Lunch",
    category: "food",
    categoryId: "1",
    date: new Date(),
    userId: "user1",
    isExpense: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t2",
    amount: 500000,
    description: "Salary",
    category: "salary",
    categoryId: "2",
    date: new Date(),
    userId: "user1",
    isExpense: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockSummary = {
  totalIncome: 500000,
  totalExpense: 1200,
  balance: 498800,
  currentMonth: "2024-01",
  summary: {
    totalIncome: 500000,
    totalExpense: 1200,
    balance: 498800,
  },
  monthlyStats: [],
  categoryStats: [],
};

const mockMetadata = {
  totalCount: 2,
  totalPages: 1,
  currentPage: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export const Default: Story = {
  args: {
    summary: mockSummary.summary,
    monthlyStats: [
      { month: "2023-11", income: 450000, expense: 200000 },
      { month: "2023-12", income: 480000, expense: 250000 },
      { month: "2024-01", income: 500000, expense: 1200 },
    ],
    categoryStats: [
      { category: "food", amount: 1200 },
      { category: "transport", amount: 5000 },
    ],
    currentMonth: "2024-01",
    transactions: mockTransactions,
    metadata: mockMetadata,
    categories: mockCategories,
  },
};
