import type { Meta, StoryObj } from "@storybook/react";
import { StoreNameMigrationTool } from "./store-name-migration-tool";

const meta: Meta<typeof StoreNameMigrationTool> = {
  title: "Features/Settings/StoreNameMigrationTool",
  component: StoreNameMigrationTool,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof StoreNameMigrationTool>;

export const Default: Story = {};
