import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { PaginationControl } from "./pagination-control";

const meta: Meta<typeof PaginationControl> = {
  title: "Features/Transaction/PaginationControl",
  component: PaginationControl,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Page navigation control with previous/next buttons and current page indicator. Disables buttons at boundaries (first/last page).",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PaginationControl>;

export const Default: Story = {
  args: {
    totalPages: 10,
    currentPage: 1,
    onPageChange: fn(),
  },
};

export const MiddlePage: Story = {
  args: {
    totalPages: 10,
    currentPage: 5,
    onPageChange: fn(),
  },
};

export const LastPage: Story = {
  args: {
    totalPages: 10,
    currentPage: 10,
    onPageChange: fn(),
  },
};

export const NavigateNext: Story = {
  args: {
    totalPages: 5,
    currentPage: 1,
    onPageChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const nextButton = canvas.getByRole("button", {
      name: "Go to next page",
    });
    await expect(nextButton).toBeEnabled();
    await userEvent.click(nextButton);

    await expect(args.onPageChange).toHaveBeenCalledWith(2);
  },
};

export const PreviousDisabledOnFirstPage: Story = {
  args: {
    totalPages: 5,
    currentPage: 1,
    onPageChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const prevButton = canvas.getByRole("button", {
      name: "Go to previous page",
    });
    await expect(prevButton).toBeDisabled();
  },
};

export const NextDisabledOnLastPage: Story = {
  args: {
    totalPages: 5,
    currentPage: 5,
    onPageChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nextButton = canvas.getByRole("button", {
      name: "Go to next page",
    });
    await expect(nextButton).toBeDisabled();
  },
};
