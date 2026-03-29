import type { Meta, StoryObj } from "@storybook/react";
import { RecentTransactions } from "./recent-transactions";

const meta: Meta<typeof RecentTransactions> = {
  title: "Features/Dashboard/Widgets/RecentTransactions",
  component: RecentTransactions,
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
        amount: 350,
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
    ],
  },
};

export const Empty: Story = {
  args: {
    currentMonth: "2024-01",
    transactions: [],
  },
};
