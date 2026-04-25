import type { Meta, StoryObj } from "@storybook/react";
import { StoreManager } from "./store-manager";

const meta: Meta<typeof StoreManager> = {
  title: "Features/Store/StoreManager",
  component: StoreManager,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "CRUD management for stores/services. Allows creating, editing, and deleting store names used in transactions.",
      },
    },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof StoreManager>;

const mockStores = [
  {
    id: "store-1",
    name: "セブンイレブン",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "store-2",
    name: "スーパーマーケット",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "store-3",
    name: "Amazon",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const Default: Story = {
  args: {
    stores: mockStores,
  },
};

export const Empty: Story = {
  args: {
    stores: [],
  },
};
