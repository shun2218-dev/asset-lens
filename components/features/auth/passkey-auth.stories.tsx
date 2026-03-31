import type { Meta, StoryObj } from "@storybook/react";
import { PasskeyAuth } from "./passkey-auth";

const meta: Meta<typeof PasskeyAuth> = {
  title: "Features/Auth/PasskeyAuth",
  component: PasskeyAuth,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "WebAuthn passkey authentication component. Handles both passkey registration and login flows with browser credential API.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PasskeyAuth>;

export const Guest: Story = {
  parameters: {
    auth: {
      session: null,
    },
  },
};

export const LoggedIn: Story = {
  parameters: {
    auth: {
      session: {
        user: {
          id: "mock-user-id",
          email: "mock@example.com",
          name: "Storybook User",
        },
        session: {
          id: "mock-session-id",
        },
      },
    },
  },
};
