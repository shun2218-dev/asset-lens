import type { Meta, StoryObj } from "@storybook/react";
import { SiteFooter } from "./site-footer";

const meta: Meta<typeof SiteFooter> = {
  title: "Layouts/SiteFooter",
  component: SiteFooter,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Application footer with copyright notice and version info. Displayed on public-facing pages.",
      },
    },
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SiteFooter>;

export const Default: Story = {};
