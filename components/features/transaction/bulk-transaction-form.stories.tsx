import type { Meta, StoryObj } from "@storybook/react";
import { BulkTransactionForm } from "./bulk-transaction-form";

const meta: Meta<typeof BulkTransactionForm> = {
  title: "Features/Transaction/BulkTransactionForm",
  component: BulkTransactionForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof BulkTransactionForm>;

const mockCategories = [
  {
    id: "cat-1",
    slug: "food",
    name: "食費",
    type: "expense",
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 1,
  },
  {
    id: "cat-2",
    slug: "transport",
    name: "交通費",
    type: "expense",
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 2,
  },
  {
    id: "cat-3",
    slug: "daily",
    name: "日用品",
    type: "expense",
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 3,
  },
];

export const Default: Story = {
  args: {
    categories: mockCategories,
    stores: [],
  },
};
