import type { Meta, StoryObj } from "@storybook/react";
import { LoggedInView } from "./logged-in-view";

const meta: Meta<typeof LoggedInView> = {
  title: "Features/Auth/LoggedInView",
  component: LoggedInView,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof LoggedInView>;

// Mock session object structure as expected by authClient.$Infer.Session
// Since we can't easily import the exact inferred type here without the client setup,
// we'll mock the shape based on usage in the component.
const mockSession = {
  user: {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: null,
  },
  session: {
    id: "session-1",
    userId: "user-1",
    expiresAt: new Date(Date.now() + 86400000), // tomorrow
    token: "mock-token",
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
  },
};

export const Default: Story = {
  args: {
    session: mockSession,
  },
};
