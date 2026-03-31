import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { ForgetPasswordForm } from "./forget-password-form";

const meta: Meta<typeof ForgetPasswordForm> = {
  title: "Features/Auth/ForgetPasswordForm",
  component: ForgetPasswordForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Multi-step password reset form with email input, OTP verification, and new password setup. Uses controlled state machine pattern (email → otp → password steps).",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ForgetPasswordForm>;

export const Default: Story = {};

export const FillEmailAndSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailInput = canvas.getByLabelText("メールアドレス");
    await userEvent.type(emailInput, "test@example.com");

    await expect(emailInput).toHaveValue("test@example.com");

    const submitButton = canvas.getByRole("button", { name: "コードを送信" });
    await expect(submitButton).toBeEnabled();
  },
};
