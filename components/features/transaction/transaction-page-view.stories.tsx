import type { Meta, StoryObj } from "@storybook/react";
import { TransactionPageView } from "./transaction-page-view";

const meta: Meta<typeof TransactionPageView> = {
  title: "Features/Transaction/TransactionPageView",
  component: TransactionPageView,
  parameters: {
    docs: {
      description: {
        component:
          "Full transaction page layout combining form, filters, list, and pagination. Orchestrates all transaction sub-components.",
      },
    },
    layout: "fullscreen",
    a11y: {
      config: {
        rules: [
          {
            id: "aria-valid-attr-value",
            enabled: false,
          },
        ],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TransactionPageView>;

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
];

const mockTransactions = [
  {
    id: "t1",
    amount: 1200,
    description: "Lunch",
    storeName: "コンビニ",
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
    amount: 500,
    description: "Coffee",
    storeName: "カフェ",
    category: "food",
    categoryId: "1",
    date: new Date(),
    userId: "user1",
    isExpense: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMetadata = {
  totalCount: 3,
  totalPages: 1,
  currentPage: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export const Default: Story = {
  args: {
    transactions: mockTransactions,
    metadata: mockMetadata,
    currentMonth: "2024-01",
    categories: mockCategories,
    stores: [],
    templates: [],
  },
};

export const Empty: Story = {
  args: {
    transactions: [],
    metadata: {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    currentMonth: "2024-01",
    categories: mockCategories,
    stores: [],
    templates: [],
  },
};
