import type { Meta, StoryObj } from "@storybook/react";
import { QuestEmptyState } from "./quest-empty-state";

const meta: Meta<typeof QuestEmptyState> = {
  title: "Features/Insights/Quests/QuestEmptyState",
  component: QuestEmptyState,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof QuestEmptyState>;

export const Default: Story = {};
