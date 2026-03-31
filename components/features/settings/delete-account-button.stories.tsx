import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { DeleteAccountButton } from "./delete-account-button";

const meta: Meta<typeof DeleteAccountButton> = {
  title: "Features/Settings/DeleteAccountButton",
  component: DeleteAccountButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Destructive action button with confirmation dialog for permanent account deletion. Uses delayed confirm pattern (3s lock) to prevent accidental clicks.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DeleteAccountButton>;

export const Default: Story = {};

export const OpenConfirmDialog: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const deleteButton = canvas.getByRole("button", {
      name: /アカウントを削除する/,
    });
    await expect(deleteButton).toBeEnabled();
    await userEvent.click(deleteButton);

    // Wait for dialog to appear
    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(dialog).toBeInTheDocument();

    // Verify dialog content
    await expect(
      within(dialog).getByText("本当に削除しますか？"),
    ).toBeInTheDocument();

    // Cancel button should be available
    const cancelButton = within(dialog).getByRole("button", {
      name: "キャンセル",
    });
    await expect(cancelButton).toBeEnabled();

    // Close dialog
    await userEvent.click(cancelButton);
  },
};
