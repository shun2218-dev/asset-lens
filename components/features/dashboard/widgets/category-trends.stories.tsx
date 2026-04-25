import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { CategoryTrends } from "./category-trends";

const meta: Meta<typeof CategoryTrends> = {
  title: "Features/Dashboard/Widgets/CategoryTrends",
  component: CategoryTrends,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Per-category expense trend widget with sparkline charts and month-over-month change badges. Uses recharts AreaChart.",
      },
    },
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CategoryTrends>;

const mockTrends = [
  {
    categoryId: "cat-food",
    categoryName: "食費",
    months: [
      { month: "2025-11", amount: 25000 },
      { month: "2025-12", amount: 30000 },
      { month: "2026-01", amount: 28000 },
      { month: "2026-02", amount: 32000 },
      { month: "2026-03", amount: 27000 },
      { month: "2026-04", amount: 35000 },
    ],
    currentAmount: 35000,
    previousAmount: 27000,
    changePercent: 29.6,
  },
  {
    categoryId: "cat-transport",
    categoryName: "交通費",
    months: [
      { month: "2025-11", amount: 8000 },
      { month: "2025-12", amount: 7500 },
      { month: "2026-01", amount: 9000 },
      { month: "2026-02", amount: 6000 },
      { month: "2026-03", amount: 8500 },
      { month: "2026-04", amount: 7000 },
    ],
    currentAmount: 7000,
    previousAmount: 8500,
    changePercent: -17.6,
  },
  {
    categoryId: "cat-ent",
    categoryName: "娯楽",
    months: [
      { month: "2025-11", amount: 12000 },
      { month: "2025-12", amount: 15000 },
      { month: "2026-01", amount: 10000 },
      { month: "2026-02", amount: 18000 },
      { month: "2026-03", amount: 14000 },
      { month: "2026-04", amount: 14000 },
    ],
    currentAmount: 14000,
    previousAmount: 14000,
    changePercent: 0,
  },
];

export const Default: Story = {
  args: { trends: mockTrends },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("食費")).toBeInTheDocument();
    await expect(canvas.getByText("交通費")).toBeInTheDocument();
  },
};

export const SingleCategory: Story = {
  args: { trends: [mockTrends[0]] },
};

export const Empty: Story = {
  args: { trends: [] },
};
