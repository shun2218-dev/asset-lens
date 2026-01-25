import type { Meta, StoryObj } from "@storybook/react";
import { TransactionList } from "./transaction-list";

const meta: Meta<typeof TransactionList> = {
  title: "Features/Transaction/TransactionList",
  component: TransactionList,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof TransactionList>;

const mockCategories = [
  {
    id: "cat-1",
    slug: "food",
    name: "食費",
    type: "expense",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 1,
  },
  {
    id: "cat-2",
    slug: "salary",
    name: "給与",
    type: "income",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 2,
  },
];

const mockTransactions = [
  {
    id: "tx-1",
    userId: "user-1",
    amount: 1000,
    description: "Lunch",
    date: new Date("2024-01-01"),
    isExpense: true,
    category: "food",
    categoryId: "cat-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tx-2",
    userId: "user-1",
    amount: 5000,
    description: "Dinner",
    date: new Date("2024-01-02"),
    isExpense: true,
    category: "food",
    categoryId: "cat-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tx-3",
    userId: "user-1",
    amount: 200000,
    description: "Salary",
    date: new Date("2024-01-25"),
    isExpense: false,
    category: "salary",
    categoryId: "cat-2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const Default: Story = {
  args: {
    initialData: mockTransactions,
    initialMetadata: {
      totalPages: 10,
      totalCount: 100,
      currentPage: 1,
    },
    currentMonth: "2024-01",
    categories: mockCategories,
  },
};

export const Empty: Story = {
  args: {
    initialData: [],
    initialMetadata: {
      totalPages: 0,
      totalCount: 0,
      currentPage: 1,
    },
    currentMonth: "2024-01",
    categories: mockCategories,
  },
};
