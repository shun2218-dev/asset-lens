import type { Meta, StoryObj } from "@storybook/react";
import { PaginationControl } from "./pagination-control";

const meta: Meta<typeof PaginationControl> = {
  title: "Features/Transaction/PaginationControl",
  component: PaginationControl,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PaginationControl>;

export const Default: Story = {
  args: {
    totalPages: 10,
    currentPage: 1,
    onPageChange: (page) => console.log(`Page changed to ${page}`),
  },
};

export const MiddlePage: Story = {
  args: {
    totalPages: 10,
    currentPage: 5,
    onPageChange: (page) => console.log(`Page changed to ${page}`),
  },
};

export const LastPage: Story = {
  args: {
    totalPages: 10,
    currentPage: 10,
    onPageChange: (page) => console.log(`Page changed to ${page}`),
  },
};
