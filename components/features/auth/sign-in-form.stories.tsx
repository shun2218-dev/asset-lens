import type { Meta, StoryObj } from "@storybook/react";
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
