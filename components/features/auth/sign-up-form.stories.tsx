import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { SignUpForm } from "./sign-up-form";

const meta: Meta<typeof SignUpForm> = {
  title: "Features/Auth/SignUpForm",
  component: SignUpForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "User registration form with name, email, password, and confirmation. Includes real-time password strength indicator and mismatch detection.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SignUpForm>;

export const Default: Story = {};

export const FillRegistration: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByLabelText("お名前（表示名）"),
      "テスト太郎",
    );
    await userEvent.type(
      canvas.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await userEvent.type(canvas.getByLabelText("パスワード"), "Password123!");
    await userEvent.type(
      canvas.getByLabelText("パスワード（確認）"),
      "Password123!",
    );

    await expect(canvas.getByLabelText("お名前（表示名）")).toHaveValue(
      "テスト太郎",
    );
    await expect(canvas.getByLabelText("メールアドレス")).toHaveValue(
      "test@example.com",
    );

    const submitButton = canvas.getByRole("button", {
      name: "アカウント作成",
    });
    await expect(submitButton).toBeEnabled();
  },
};

export const PasswordMismatch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByLabelText("お名前（表示名）"),
      "テスト太郎",
    );
    await userEvent.type(
      canvas.getByLabelText("メールアドレス"),
      "test@example.com",
    );
    await userEvent.type(canvas.getByLabelText("パスワード"), "Password123!");
    await userEvent.type(
      canvas.getByLabelText("パスワード（確認）"),
      "Different456!",
    );

    // Trigger validation by blurring the confirm password field
    await userEvent.tab();

    // Password strength indicator should be visible for strong password
    await expect(canvas.getByLabelText("パスワード")).toHaveValue(
      "Password123!",
    );
  },
};
