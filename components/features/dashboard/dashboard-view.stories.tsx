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
    name: "食費",
    slug: "food",
    type: "expense" as const,
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 1,
  },
  {
    id: "2",
    name: "給与",
    slug: "salary",
    type: "income" as const,
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 2,
  },
  {
    id: "3",
    name: "交通費",
    slug: "transport",
    type: "expense" as const,
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 3,
  },
];

const mockRecentTransactions = [
  {
    id: "t1",
    amount: 1200,
    description: "ランチ",
    storeName: "コンビニA",
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
    description: "給与",
    storeName: null,
    category: "salary",
    categoryId: "2",
    date: new Date(),
    userId: "user1",
    isExpense: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t3",
    amount: 800,
    description: "コーヒー",
    storeName: "スタバ",
    category: "food",
    categoryId: "1",
    date: new Date(),
    userId: "user1",
    isExpense: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const Default: Story = {
  args: {
    summary: {
      totalIncome: 500000,
      totalExpense: 82000,
      balance: 418000,
    },
    previousSummary: {
      totalIncome: 480000,
      totalExpense: 95000,
      balance: 385000,
    },
    monthlyStats: [
      { month: "2023-11", income: 450000, expense: 200000 },
      { month: "2023-12", income: 480000, expense: 250000 },
      { month: "2024-01", income: 500000, expense: 82000 },
    ],
    categoryStats: [
      { category: "food", amount: 45000 },
      { category: "transport", amount: 12000 },
      { category: "entertainment", amount: 25000 },
    ],
    currentMonth: "2024-01",
    recentTransactions: mockRecentTransactions,
    storeRanking: [
      { storeName: "スーパーA", totalAmount: 18000 },
      { storeName: "コンビニB", totalAmount: 12000 },
      { storeName: "スタバ", totalAmount: 8000 },
      { storeName: "ドラッグストア", totalAmount: 5000 },
      { storeName: "ユニクロ", totalAmount: 3000 },
    ],
    categories: mockCategories,
  },
};

export const Empty: Story = {
  args: {
    summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
    previousSummary: { totalIncome: 0, totalExpense: 0, balance: 0 },
    monthlyStats: [],
    categoryStats: [],
    currentMonth: "2024-01",
    recentTransactions: [],
    storeRanking: [],
    categories: mockCategories,
  },
};
