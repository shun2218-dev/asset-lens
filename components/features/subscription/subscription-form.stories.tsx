import type { Meta, StoryObj } from "@storybook/react";
import { SubscriptionForm } from "./subscription-form";

const meta: Meta<typeof SubscriptionForm> = {
  title: "Features/Subscription/SubscriptionForm",
  component: SubscriptionForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SubscriptionForm>;

export const Default: Story = {};
