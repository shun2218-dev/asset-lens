import type { Meta, StoryObj } from "@storybook/react";
import { SettingsView } from "./settings-view";

const meta: Meta<typeof SettingsView> = {
  title: "Features/Settings/SettingsView",
  component: SettingsView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SettingsView>;

const mockSession = {
  user: {
    name: "Test User",
    email: "test@example.com",
  },
};

const mockSubscriptions = [
  {
    id: "sub1",
    name: "Netflix",
    amount: 1490,
    category: "Entertainment",
    billingCycle: "monthly" as const,
    nextPaymentDate: new Date("2024-02-01"),
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
    currency: "JPY",
    status: "active",
  },
  {
    id: "sub2",
    name: "Amazon Prime",
    amount: 5900,
    category: "Shopping",
    billingCycle: "yearly" as const,
    nextPaymentDate: new Date("2024-05-15"),
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
    currency: "JPY",
    status: "active",
  },
];

export const Default: Story = {
  args: {
    session: mockSession,
    subscriptions: mockSubscriptions,
  },
};

export const Empty: Story = {
  args: {
    session: mockSession,
    subscriptions: [],
  },
};
