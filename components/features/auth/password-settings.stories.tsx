import type { Meta, StoryObj } from "@storybook/react";
import { PasswordSettings } from "./password-settings";

const meta: Meta<typeof PasswordSettings> = {
  title: "Features/Auth/PasswordSettings",
  component: PasswordSettings,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Password change form in security settings. Validates current password and enforces strength requirements for new password.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PasswordSettings>;

export const Default: Story = {};
