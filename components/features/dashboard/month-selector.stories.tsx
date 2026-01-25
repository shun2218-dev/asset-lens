import type { Meta, StoryObj } from "@storybook/react";
import { MonthSelector } from "./month-selector";

const meta: Meta<typeof MonthSelector> = {
  title: "Features/Dashboard/MonthSelector",
  component: MonthSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof MonthSelector>;

export const Default: Story = {
  args: {
    currentMonth: "2024-01",
  },
};

export const CurrentMonth: Story = {
  args: {
    currentMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
  },
};
