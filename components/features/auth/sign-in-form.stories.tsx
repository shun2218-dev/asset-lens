import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { SignInForm } from "./sign-in-form";

const meta: Meta<typeof SignInForm> = {
  title: "Features/Auth/SignInForm",
  component: SignInForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SignInForm>;

export const Default: Story = {};

export const FillAndSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailInput = canvas.getByLabelText("メールアドレス");
    const passwordInput = canvas.getByLabelText("パスワード");

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123!");

    await expect(emailInput).toHaveValue("test@example.com");
    await expect(passwordInput).toHaveValue("Password123!");

    const submitButton = canvas.getByRole("button", { name: "ログイン" });
    await expect(submitButton).toBeEnabled();
  },
};

export const EmptySubmitValidation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const submitButton = canvas.getByRole("button", { name: "ログイン" });
    await userEvent.click(submitButton);

    // Form should show validation — inputs still empty
    const emailInput = canvas.getByLabelText("メールアドレス");
    await expect(emailInput).toHaveValue("");
  },
};
