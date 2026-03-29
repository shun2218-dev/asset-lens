import type { Meta, StoryObj } from "@storybook/react";
import { TransactionFilters } from "./transaction-filters";

const meta: Meta<typeof TransactionFilters> = {
  title: "Features/Transaction/TransactionFilters",
  component: TransactionFilters,
  tags: ["autodocs"],
  parameters: {
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
    onFiltersChange: () => {},
    onReset: () => {},
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
    onFiltersChange: () => {},
    onReset: () => {},
  },
};
