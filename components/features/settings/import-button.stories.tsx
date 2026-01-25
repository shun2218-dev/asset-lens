import type { Meta, StoryObj } from "@storybook/react";
import { ImportButton } from "./import-button";

const meta: Meta<typeof ImportButton> = {
  title: "Features/Settings/ImportButton",
  component: ImportButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ImportButton>;

export const Default: Story = {};
