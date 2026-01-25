import type { Meta, StoryObj } from "@storybook/react";
import { ForgetPasswordForm } from "./forget-password-form";

const meta: Meta<typeof ForgetPasswordForm> = {
  title: "Features/Auth/ForgetPasswordForm",
  component: ForgetPasswordForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ForgetPasswordForm>;

export const Default: Story = {};
