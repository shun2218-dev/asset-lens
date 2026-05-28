import type { Meta, StoryObj } from "@storybook/react";
import type { Quest } from "@/app/actions/analysis/get-dynamic-quests";
import { QuestCard } from "./quest-card";

const baseQuest: Quest = {
  id: "weekly:store:セブンイレブン:2026-04-13",
  cadence: "weekly",
  targetKind: "store",
  targetLabel: "セブンイレブン",
  targetId: "セブンイレブン",
  thresholdJpy: 7000,
  spentJpy: 2000,
  progressPct: 29,
  status: "on_track",
  periodStart: "2026-04-13",
  periodEnd: "2026-04-19",
};

const meta: Meta<typeof QuestCard> = {
  title: "Features/Insights/Quests/QuestCard",
  component: QuestCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A single dynamic quest card. Status drives the progress bar colour, badge label, and overage notice.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof QuestCard>;

export const OnTrack: Story = {
  args: { quest: baseQuest },
};

export const Warning: Story = {
  args: {
    quest: {
      ...baseQuest,
      spentJpy: 5800,
      progressPct: 83,
      status: "warning",
    },
  },
};

export const Failed: Story = {
  args: {
    quest: {
      ...baseQuest,
      spentJpy: 9000,
      progressPct: 129,
      status: "failed",
    },
  },
};

export const Completed: Story = {
  args: {
    quest: {
      ...baseQuest,
      spentJpy: 5500,
      progressPct: 79,
      status: "completed",
    },
  },
};

export const MonthlyCategory: Story = {
  args: {
    quest: {
      ...baseQuest,
      id: "monthly:category:cat-food:2026-04-01",
      cadence: "monthly",
      targetKind: "category",
      targetLabel: "食費",
      targetId: "cat-food",
      thresholdJpy: 42500,
      spentJpy: 30000,
      progressPct: 71,
      status: "warning",
      periodStart: "2026-04-01",
      periodEnd: "2026-04-30",
    },
  },
};
