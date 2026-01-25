import type { Meta, StoryObj } from "@storybook/react";
import { TransactionItemMenu } from "./transaction-item-menu";

const meta: Meta<typeof TransactionItemMenu> = {
  title: "Features/Transaction/TransactionItemMenu",
  component: TransactionItemMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TransactionItemMenu>;

const mockCategories = [
  { id: "cat-1", slug: "food", name: "食費", type: "expense", userId: "user-1", createdAt: new Date(), updatedAt: new Date(), sortOrder: 1 },
  { id: "cat-2", slug: "salmon", name: "給与", type: "income", userId: "user-1", createdAt: new Date(), updatedAt: new Date(), sortOrder: 2 },
];

export const Default: Story = {
  args: {
    transaction: {
      id: "tx-1",
      userId: "user-1",
      amount: 1000,
      description: "Lunch",
      category: "food",
      categoryId: "cat-1",
      date: new Date("2024-01-01"),
      isExpense: true,
    },
    categories: mockCategories,
  },
};
