import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { MonthSelector } from "./month-selector";

const meta: Meta<typeof MonthSelector> = {
  title: "Features/Dashboard/MonthSelector",
  component: MonthSelector,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Month navigation control with previous/next buttons. Disables forward navigation beyond current month to prevent future date selection.",
      },
    },
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
    currentMonth: new Date().toISOString().substring(0, 7),
  },
};

export const NavigatePrevious: Story = {
  args: {
    currentMonth: "2024-06",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const prevButton = canvas.getByRole("button", { name: "Previous month" });
    await expect(prevButton).toBeEnabled();
    await userEvent.click(prevButton);
  },
};

export const NextDisabledOnCurrentMonth: Story = {
  args: {
    currentMonth: new Date().toISOString().substring(0, 7),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nextButton = canvas.getByRole("button", { name: "Next month" });
    await expect(nextButton).toBeDisabled();
  },
};
