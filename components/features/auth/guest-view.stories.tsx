import type { Meta, StoryObj } from "@storybook/react";
import { GuestView } from "./guest-view";

const meta: Meta<typeof GuestView> = {
  title: "Features/Auth/GuestView",
  component: GuestView,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof GuestView>;

export const Default: Story = {};
