import type { Meta, StoryObj } from "@storybook/react";
import { SubscriptionList } from "./subscription-list";

const meta: Meta<typeof SubscriptionList> = {
  title: "Features/Subscription/SubscriptionList",
  component: SubscriptionList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof SubscriptionList>;

const now = new Date();

export const WithSubscriptions: Story = {
  args: {
    subscriptions: [
      {
        id: "sub-1",
        userId: "u-1",
        name: "Netflix",
        amount: 1490,
        currency: "JPY",
        billingCycle: "monthly",
        nextPaymentDate: new Date("2024-04-15"),
        category: "subscription",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "sub-2",
        userId: "u-1",
        name: "Spotify",
        amount: 980,
        currency: "JPY",
        billingCycle: "monthly",
        nextPaymentDate: new Date("2024-04-20"),
        category: "subscription",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "sub-3",
        userId: "u-1",
        name: "Adobe Creative Cloud",
        amount: 72336,
        currency: "JPY",
        billingCycle: "yearly",
        nextPaymentDate: new Date("2025-01-01"),
        category: "subscription",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    subscriptions: [],
  },
};
