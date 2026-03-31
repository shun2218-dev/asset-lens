import type { Meta, StoryObj } from "@storybook/react";
import { StoreNameMigrationTool } from "./store-name-migration-tool";

const meta: Meta<typeof StoreNameMigrationTool> = {
  title: "Features/Settings/StoreNameMigrationTool",
  component: StoreNameMigrationTool,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bulk store name migration utility. Allows renaming stores across all historical transactions with preview and selective application.",
      },
    },
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof StoreNameMigrationTool>;

export const Default: Story = {};
