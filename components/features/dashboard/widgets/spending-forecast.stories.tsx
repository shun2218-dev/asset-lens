import type { Meta, StoryObj } from "@storybook/react";
import { SpendingForecast } from "./spending-forecast";

const meta: Meta<typeof SpendingForecast> = {
  title: "Features/Dashboard/Widgets/SpendingForecast",
  component: SpendingForecast,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Spending forecast widget showing projected end-of-month spending with color-coded status.",
      },
    },
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SpendingForecast>;

export const OnTrack: Story = {
  args: {
    forecast: {
      currentMonth: "2026-04",
      daysElapsed: 15,
      daysInMonth: 30,
      currentSpend: 40000,
      projectedSpend: 80000,
      dailyRate: 2667,
      historicalAverage: 90000,
      budgetAmount: 100000,
      status: "on_track",
    },
  },
};

export const Warning: Story = {
  args: {
    forecast: {
      currentMonth: "2026-04",
      daysElapsed: 20,
      daysInMonth: 30,
      currentSpend: 55000,
      projectedSpend: 82500,
      dailyRate: 2750,
      historicalAverage: 85000,
      budgetAmount: 100000,
      status: "warning",
    },
  },
};

export const OverBudget: Story = {
  args: {
    forecast: {
      currentMonth: "2026-04",
      daysElapsed: 10,
      daysInMonth: 30,
      currentSpend: 60000,
      projectedSpend: 180000,
      dailyRate: 6000,
      historicalAverage: 100000,
      budgetAmount: 120000,
      status: "over_budget",
    },
  },
};

export const InsufficientData: Story = {
  args: {
    forecast: {
      currentMonth: "2026-04",
      daysElapsed: 3,
      daysInMonth: 30,
      currentSpend: 5000,
      projectedSpend: 0,
      dailyRate: 1667,
      historicalAverage: 0,
      budgetAmount: null,
      status: "insufficient_data",
    },
  },
};

export const NoBudget: Story = {
  args: {
    forecast: {
      currentMonth: "2026-04",
      daysElapsed: 15,
      daysInMonth: 30,
      currentSpend: 45000,
      projectedSpend: 90000,
      dailyRate: 3000,
      historicalAverage: 85000,
      budgetAmount: null,
      status: "warning",
    },
  },
};
