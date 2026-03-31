import type { Meta, StoryObj } from "@storybook/react";
import { ExportButton } from "./export-button";

const meta: Meta<typeof ExportButton> = {
  title: "Features/Settings/ExportButton",
  component: ExportButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Data export button supporting CSV and PDF formats. Triggers server action to generate and download financial data.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ExportButton>;

export const Default: Story = {};
