import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { TransactionFilters } from "./transaction-filters";

const meta: Meta<typeof TransactionFilters> = {
  title: "Features/Transaction/TransactionFilters",
  component: TransactionFilters,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Transaction list filter controls: text search, category dropdown, date range pickers, and reset button. All filters are controlled via callbacks.",
      },
    },
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof TransactionFilters>;

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
];

export const Default: Story = {
  args: {
    categories: mockCategories,
    filters: {},
    onFiltersChange: fn(),
    onReset: fn(),
  },
};

export const WithActiveFilters: Story = {
  args: {
    categories: mockCategories,
    filters: {
      categoryId: "cat-1",
      searchQuery: "ランチ",
      dateFrom: new Date("2024-03-01"),
      dateTo: new Date("2024-03-31"),
    },
    onFiltersChange: fn(),
    onReset: fn(),
  },
};

export const TypeSearchQuery: Story = {
  args: {
    ...Default.args,
    onFiltersChange: fn(),
    onReset: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const searchInput = canvas.getByPlaceholderText("内容・店舗名で検索...");
    await userEvent.type(searchInput, "lunch");

    // Debounced at 300ms — wait for the callback to fire
    await waitFor(() => expect(args.onFiltersChange).toHaveBeenCalled(), {
      timeout: 1000,
    });
  },
};

export const ResetFilters: Story = {
  args: {
    categories: mockCategories,
    filters: {
      searchQuery: "テスト",
    },
    onFiltersChange: fn(),
    onReset: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const resetButton = canvas.getByRole("button", { name: /リセット/ });
    await userEvent.click(resetButton);

    await expect(args.onReset).toHaveBeenCalledOnce();
  },
};
