import type { Meta, StoryObj } from "@storybook/react";
import { GuestView } from "./guest-view";

const meta: Meta<typeof GuestView> = {
  title: "Features/Auth/GuestView",
  component: GuestView,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Landing page view shown to unauthenticated users. Displays sign-in and sign-up options with app branding.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof GuestView>;

export const Default: Story = {};
