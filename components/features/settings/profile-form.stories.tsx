import type { Meta, StoryObj } from "@storybook/react";
import { ProfileForm } from "./profile-form";

const meta: Meta<typeof ProfileForm> = {
  title: "Features/Settings/ProfileForm",
  component: ProfileForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProfileForm>;

export const Default: Story = {
  args: {
    initialData: {
      name: "Test User",
      image: null,
    },
  },
};

export const WithImage: Story = {
  args: {
    initialData: {
      name: "Test User",
      image: "https://github.com/shadcn.png",
    },
  },
};
