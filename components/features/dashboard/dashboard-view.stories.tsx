import type { Meta, StoryObj } from "@storybook/react";
import { DashboardView } from "./dashboard-view";

const meta: Meta<typeof DashboardView> = {
  title: "Features/Dashboard/DashboardView",
  component: DashboardView,
  parameters: {
    docs: {
      description: {
        component:
          "Main dashboard page with summary cards, month-over-month comparison, budget progress, charts, and recent transactions. Shows empty state for new users.",
      },
    },
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
    icon: null,
    color: null,
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
    icon: null,
    color: null,
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
    icon: null,
    color: null,
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
    overview: {
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
      currentMonth: "2024-01",
    },
    charts: {
      monthlyStats: [
        { month: "2023-11", income: 450000, expense: 200000 },
        { month: "2023-12", income: 480000, expense: 250000 },
        { month: "2024-01", income: 500000, expense: 82000 },
      ],
      categoryStats: [],
      categories: mockCategories,
    },
    widgets: {
      recentTransactions: mockRecentTransactions,
      storeRanking: [
        { storeName: "スーパーA", totalAmount: 18000 },
        { storeName: "コンビニB", totalAmount: 12000 },
        { storeName: "スタバ", totalAmount: 8000 },
        { storeName: "ドラッグストア", totalAmount: 5000 },
        { storeName: "ユニクロ", totalAmount: 3000 },
      ],
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
          categoryId: "1",
          amount: 50000,
          category: mockCategories[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      categoryExpenses: [
        { categoryId: "1", amount: 45000 },
        { categoryId: "3", amount: 12000 },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    overview: {
      summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
      previousSummary: { totalIncome: 0, totalExpense: 0, balance: 0 },
      currentMonth: "2024-01",
    },
    charts: {
      monthlyStats: [],
      categoryStats: [],
      categories: mockCategories,
    },
    widgets: {
      recentTransactions: [],
      storeRanking: [],
      budgets: [],
      categoryExpenses: [],
    },
  },
};

export const FallbackBanner: Story = {
  args: {
    overview: {
      summary: {
        totalIncome: 480000,
        totalExpense: 95000,
        balance: 385000,
      },
      previousSummary: {
        totalIncome: 450000,
        totalExpense: 88000,
        balance: 362000,
      },
      currentMonth: "2024-03",
      isFallback: true,
      requestedMonth: "2024-04",
    },
    charts: {
      monthlyStats: [
        { month: "2024-01", income: 450000, expense: 200000 },
        { month: "2024-02", income: 450000, expense: 88000 },
        { month: "2024-03", income: 480000, expense: 95000 },
      ],
      categoryStats: [],
      categories: mockCategories,
    },
    widgets: {
      recentTransactions: mockRecentTransactions,
      storeRanking: [
        { storeName: "スーパーA", totalAmount: 18000 },
        { storeName: "コンビニB", totalAmount: 12000 },
      ],
      budgets: [],
      categoryExpenses: [
        { categoryId: "1", amount: 45000 },
        { categoryId: "3", amount: 12000 },
      ],
    },
  },
};
