import type { Meta, StoryObj } from "@storybook/react";
import { Table, TableBody } from "@/components/ui/table";
import { TransactionItem } from "./transaction-item";

const meta: Meta<typeof TransactionItem> = {
  title: "Features/Transaction/TransactionItem",
  component: TransactionItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <Story />
        </TableBody>
      </Table>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransactionItem>;

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
    slug: "salmon",
    name: "給与",
    type: "income",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 2,
  },
];

export const Expense: Story = {
  args: {
    data: {
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
    categories: mockCategories,
  },
};

export const Income: Story = {
  args: {
    data: {
      id: "tx-2",
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
    categories: mockCategories,
  },
};
