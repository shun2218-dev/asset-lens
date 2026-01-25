import type { Meta, StoryObj } from "@storybook/react";
import { TransactionForm } from "./transaction-form";

const meta: Meta<typeof TransactionForm> = {
  title: "Features/Transaction/TransactionForm",
  component: TransactionForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TransactionForm>;

const mockCategories = [
  { id: "cat-1", slug: "food", name: "食費", type: "expense", userId: "user-1", createdAt: new Date(), updatedAt: new Date(), sortOrder: 1 },
  { id: "cat-2", slug: "salary", name: "給与", type: "income", userId: "user-1", createdAt: new Date(), updatedAt: new Date(), sortOrder: 2 },
];

export const Create: Story = {
  args: {
    categories: mockCategories,
  },
};

export const Edit: Story = {
  args: {
    id: "tx-1",
    initialData: {
      userId: "user-1",
      amount: 1500,
      description: "Lunch Bento",
      category: "food",
      date: new Date("2024-02-01"),
      isExpense: true,
    },
    categories: mockCategories,
  },
};
