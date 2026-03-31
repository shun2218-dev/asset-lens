import type { Meta, StoryObj } from "@storybook/react";
import { PasskeySettings } from "./passkey-settings";

const meta: Meta<typeof PasskeySettings> = {
  title: "Features/Auth/PasskeySettings",
  component: PasskeySettings,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Passkey management panel for security settings. Lists registered passkeys and provides add/remove functionality.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PasskeySettings>;

export const Default: Story = {};
