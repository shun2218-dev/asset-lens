import type { Meta, StoryObj } from "@storybook/react";
import { DeleteAccountButton } from "./delete-account-button";

const meta: Meta<typeof DeleteAccountButton> = {
  title: "Features/Settings/DeleteAccountButton",
  component: DeleteAccountButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DeleteAccountButton>;

export const Default: Story = {};
