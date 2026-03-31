import type { Meta, StoryObj } from "@storybook/react";
import { ImportButton } from "./import-button";

const meta: Meta<typeof ImportButton> = {
  title: "Features/Settings/ImportButton",
  component: ImportButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "CSV file import button with drag-and-drop support. Parses uploaded CSV and creates transactions in bulk.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ImportButton>;

export const Default: Story = {};
