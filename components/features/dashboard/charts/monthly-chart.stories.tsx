import type { Meta, StoryObj } from "@storybook/react";
import { MonthlyChart } from "./monthly-chart";

const meta: Meta<typeof MonthlyChart> = {
  title: "Features/Dashboard/Charts/MonthlyChart",
  component: MonthlyChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bar chart comparing income vs expense over monthly periods. Displays side-by-side bars with Recharts and custom tooltips.",
      },
    },
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 600, height: 350 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MonthlyChart>;

export const Default: Story = {
  args: {
    data: [
      { name: "2024-01", income: 300000, expense: 180000 },
      { name: "2024-02", income: 300000, expense: 210000 },
      { name: "2024-03", income: 320000, expense: 195000 },
      { name: "2024-04", income: 300000, expense: 220000 },
      { name: "2024-05", income: 350000, expense: 200000 },
      { name: "2024-06", income: 300000, expense: 185000 },
    ],
  },
};

export const SingleMonth: Story = {
  args: {
    data: [{ name: "2024-01", income: 300000, expense: 180000 }],
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};
