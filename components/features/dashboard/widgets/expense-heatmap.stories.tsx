import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { ExpenseHeatmap } from "./expense-heatmap";

const meta: Meta<typeof ExpenseHeatmap> = {
  title: "Features/Dashboard/Widgets/ExpenseHeatmap",
  component: ExpenseHeatmap,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "GitHub-grass-style calendar heatmap showing daily spending intensity. 5-level color scale from transparent to deep green.",
      },
    },
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ExpenseHeatmap>;

function generateMockExpenses(month: string) {
  const [year, mon] = month.split("-").map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const expenses = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if (Math.random() > 0.3) {
      expenses.push({
        date: `${month}-${String(d).padStart(2, "0")}`,
        amount: Math.floor(Math.random() * 10000),
      });
    }
  }
  return expenses;
}

export const Default: Story = {
  args: {
    currentMonth: "2026-04",
    dailyExpenses: generateMockExpenses("2026-04"),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/支出ヒートマップ/)).toBeInTheDocument();
    // Weekday headers should be present
    await expect(canvas.getByText("月")).toBeInTheDocument();
    await expect(canvas.getByText("日")).toBeInTheDocument();
  },
};

export const NoExpenses: Story = {
  args: {
    currentMonth: "2026-04",
    dailyExpenses: [],
  },
};

export const FullMonth: Story = {
  args: {
    currentMonth: "2026-03",
    dailyExpenses: Array.from({ length: 31 }, (_, i) => ({
      date: `2026-03-${String(i + 1).padStart(2, "0")}`,
      amount: (i + 1) * 500,
    })),
  },
};
