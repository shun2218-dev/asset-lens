import type { Meta, StoryObj } from "@storybook/react";
import { ShortcutHelpDialog } from "./shortcut-help-dialog";

const meta: Meta<typeof ShortcutHelpDialog> = {
  title: "Features/Shortcuts/ShortcutHelpDialog",
  component: ShortcutHelpDialog,
  parameters: {
    docs: {
      description: {
        component:
          "Keyboard shortcut reference dialog. Lists all available shortcuts (Cmd+N, Cmd+K, etc.) grouped by feature area.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutHelpDialog>;

export const Default: Story = {
  render: () => <ShortcutHelpDialog />,
};
