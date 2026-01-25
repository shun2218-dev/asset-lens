import type { Meta, StoryObj } from "@storybook/react";
import { SiteHeader } from "./site-header";

const meta: Meta<typeof SiteHeader> = {
  title: "Layouts/SiteHeader",
  component: SiteHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SiteHeader>;

// Note: This story currently renders the unauthenticated state
// because useSession hook will return null/loading in Storybook environment
// without extensive mocking infrastructure.
export const Default: Story = {};
