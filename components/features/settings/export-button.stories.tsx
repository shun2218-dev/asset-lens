import type { Meta, StoryObj } from "@storybook/react";
import { ExportButton } from "./export-button";

const meta: Meta<typeof ExportButton> = {
  title: "Features/Settings/ExportButton",
  component: ExportButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ExportButton>;

export const Default: Story = {};
