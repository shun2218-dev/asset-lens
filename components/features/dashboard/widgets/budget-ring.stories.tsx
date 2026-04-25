import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { BudgetRing } from "./budget-ring";

const meta: Meta<typeof BudgetRing> = {
  title: "Features/Dashboard/Widgets/BudgetRing",
  component: BudgetRing,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Circular SVG progress ring widget showing budget consumption. Color shifts green → amber → red as spending increases. Animated count-up on mount.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof BudgetRing>;

export const Default: Story = {
  args: { spent: 45000, limit: 100000 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ring = canvas.getByRole("img");
    await expect(ring).toBeInTheDocument();
  },
};

export const LowUsage: Story = {
  args: { spent: 15000, limit: 100000 },
};

export const MediumUsage: Story = {
  args: { spent: 75000, limit: 100000 },
};

export const HighUsage: Story = {
  args: { spent: 95000, limit: 100000 },
};

export const OverBudget: Story = {
  args: { spent: 120000, limit: 100000 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Should show "予算超過" warning
    await expect(canvas.getByText("予算超過")).toBeInTheDocument();
  },
};

export const ZeroBudget: Story = {
  args: { spent: 0, limit: 0 },
};

export const CustomSize: Story = {
  args: { spent: 50000, limit: 100000, size: 200, strokeWidth: 14 },
};
