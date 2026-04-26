import type { Meta, StoryObj } from "@storybook/react";
import { RecentTransactions } from "./recent-transactions";

const meta: Meta<typeof RecentTransactions> = {
  title: "Features/Dashboard/Widgets/RecentTransactions",
  component: RecentTransactions,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Widget showing the most recent transactions on the dashboard. Displays date, description, amount with expense/income coloring.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RecentTransactions>;

export const Default: Story = {
  args: {
    currentMonth: "2024-01",
    transactions: [
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
        amount: 350,
        description: "コーヒー",
        storeName: "スタバ",
        categoryId: "1",
        date: new Date(),
        userId: "user1",
        isExpense: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    currentMonth: "2024-01",
    transactions: [],
  },
};
