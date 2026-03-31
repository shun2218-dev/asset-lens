import type { Meta, StoryObj } from "@storybook/react";
import { SubscriptionForm } from "./subscription-form";

const meta: Meta<typeof SubscriptionForm> = {
  title: "Features/Subscription/SubscriptionForm",
  component: SubscriptionForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Subscription creation/editing form for recurring payments. Includes name, amount, billing cycle, start date, and category.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SubscriptionForm>;

export const Default: Story = {};
