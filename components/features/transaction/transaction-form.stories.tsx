import type { Meta, StoryObj } from "@storybook/react";
import { TransactionForm } from "./transaction-form";

const meta: Meta<typeof TransactionForm> = {
  title: "Features/Transaction/TransactionForm",
  component: TransactionForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    a11y: {
      config: {
        rules: [
          {
            // Radix Tabs generates aria-controls for TabsContent that doesn't exist
            // when used as a styled toggle group (no TabsContent rendered)
            id: "aria-valid-attr-value",
            enabled: false,
          },
        ],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TransactionForm>;

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

export const Create: Story = {
  args: {
    categories: mockCategories,
    stores: [],
  },
};

export const Edit: Story = {
  args: {
    id: "tx-1",
    initialData: {
      userId: "user-1",
      amount: 1500,
      description: "Lunch Bento",
      storeName: "コンビニ",
      category: "food",
      date: new Date("2024-02-01"),
      isExpense: true,
    },
    categories: mockCategories,
    stores: [],
  },
};
