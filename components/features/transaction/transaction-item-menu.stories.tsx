import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { TransactionItemMenu } from "./transaction-item-menu";

const meta: Meta<typeof TransactionItemMenu> = {
  title: "Features/Transaction/TransactionItemMenu",
  component: TransactionItemMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Per-row action dropdown menu for transactions. Provides edit and delete options with confirmation dialog for deletions.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TransactionItemMenu>;

const mockCategories = [
  {
    id: "cat-1",
    slug: "food",
    name: "食費",
    type: "expense",
    icon: null,
    color: null,
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
    icon: null,
    color: null,
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 2,
  },
];

export const Default: Story = {
  args: {
    transaction: {
      id: "tx-1",
      userId: "user-1",
      amount: 1000,
      description: "Lunch",
      storeName: "コンビニ",
      category: "food",
      categoryId: "cat-1",
      date: new Date("2024-01-01"),
      isExpense: true,
    },
    categories: mockCategories,
    stores: [],
  },
};

export const OpenMenuAndSelectEdit: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dropdown menu
    const menuButton = canvas.getByRole("button", { name: "メニューを開く" });
    await userEvent.click(menuButton);

    // Verify menu items appear
    const editItem = await within(document.body).findByText("編集");
    await expect(editItem).toBeInTheDocument();

    const deleteItem = within(document.body).getByText("削除");
    await expect(deleteItem).toBeInTheDocument();
  },
};
