import type { Meta, StoryObj } from "@storybook/react";
import { CategoryPie } from "./category-pie";

const meta: Meta<typeof CategoryPie> = {
  title: "Features/Dashboard/Charts/CategoryPie",
  component: CategoryPie,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400, height: 350 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CategoryPie>;

export const Default: Story = {
  args: {
    data: [
      { name: "food", value: 45000 },
      { name: "transport", value: 12000 },
      { name: "entertainment", value: 8000 },
      { name: "utilities", value: 15000 },
      { name: "daily", value: 6000 },
    ],
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};

export const SingleCategory: Story = {
  args: {
    data: [{ name: "food", value: 30000 }],
  },
};
