import type { Meta, StoryObj } from "@storybook/react";
import { StoreSelect } from "./store-select";

const meta: Meta<typeof StoreSelect> = {
  title: "Features/Store/StoreSelect",
  component: StoreSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StoreSelect>;

const now = new Date();

const mockStores = [
  {
    id: "s-1",
    userId: "u-1",
    name: "セブンイレブン",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "s-2",
    userId: "u-1",
    name: "ファミリーマート",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "s-3",
    userId: "u-1",
    name: "スターバックス",
    createdAt: now,
    updatedAt: now,
  },
];

export const Default: Story = {
  args: {
    stores: mockStores,
    onChange: () => {},
  },
};

export const WithSelection: Story = {
  args: {
    value: "セブンイレブン",
    stores: mockStores,
    onChange: () => {},
  },
};

export const Empty: Story = {
  args: {
    stores: [],
    onChange: () => {},
  },
};
