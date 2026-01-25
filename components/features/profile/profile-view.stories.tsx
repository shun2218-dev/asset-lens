import type { Meta, StoryObj } from "@storybook/react";
import { ProfileView } from "./profile-view";

const meta: Meta<typeof ProfileView> = {
  title: "Features/Profile/ProfileView",
  component: ProfileView,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProfileView>;

export const Default: Story = {
  args: {
    session: {
      user: {
        name: "Test User",
        email: "test@example.com",
        image: null,
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    session: {
      user: {
        name: "Test User",
        email: "test@example.com",
        image: "https://github.com/shadcn.png",
      },
    },
  },
};
