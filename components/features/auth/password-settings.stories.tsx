import type { Meta, StoryObj } from "@storybook/react";
import { PasswordSettings } from "./password-settings";

const meta: Meta<typeof PasswordSettings> = {
  title: "Features/Auth/PasswordSettings",
  component: PasswordSettings,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PasswordSettings>;

export const Default: Story = {};
