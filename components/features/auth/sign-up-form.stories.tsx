import type { Meta, StoryObj } from "@storybook/react";
import { SignUpForm } from "./sign-up-form";

const meta: Meta<typeof SignUpForm> = {
  title: "Features/Auth/SignUpForm",
  component: SignUpForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SignUpForm>;

export const Default: Story = {};
