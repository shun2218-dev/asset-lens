import type { Meta, StoryObj } from "@storybook/react";
import { ShortcutHelpDialog } from "./shortcut-help-dialog";

const meta: Meta<typeof ShortcutHelpDialog> = {
  title: "Features/Shortcuts/ShortcutHelpDialog",
  component: ShortcutHelpDialog,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutHelpDialog>;

export const Default: Story = {
  render: () => <ShortcutHelpDialog />,
};
