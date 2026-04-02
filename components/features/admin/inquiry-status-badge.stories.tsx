import type { Meta, StoryObj } from "@storybook/react";
import { InquiryStatusBadge } from "./inquiry-status-badge";

const meta: Meta<typeof InquiryStatusBadge> = {
  title: "Features/Admin/InquiryStatusBadge",
  component: InquiryStatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InquiryStatusBadge>;

export const New: Story = { args: { status: "new" } };
export const InProgress: Story = { args: { status: "in_progress" } };
export const Resolved: Story = { args: { status: "resolved" } };
export const Closed: Story = { args: { status: "closed" } };
export const Unknown: Story = { args: { status: "unknown" } };
