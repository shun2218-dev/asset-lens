import type { Meta, StoryObj } from "@storybook/react";
import type {
  DynamicQuestsResult,
  Quest,
} from "@/app/actions/analysis/get-dynamic-quests";
import { QuestList } from "./quest-list";

const week = (override: Partial<Quest>): Quest => ({
  id: `weekly:store:${override.targetLabel ?? "store"}:2026-04-13`,
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
  ...override,
});

const month = (override: Partial<Quest>): Quest => ({
  id: `monthly:category:${override.targetId ?? "cat"}:2026-04-01`,
  cadence: "monthly",
  targetKind: "category",
  targetLabel: "食費",
  targetId: "cat-food",
  thresholdJpy: 42500,
  spentJpy: 12000,
  progressPct: 28,
  status: "on_track",
  periodStart: "2026-04-01",
  periodEnd: "2026-04-30",
  ...override,
});

const typical: DynamicQuestsResult = {
  generatedAt: "2026-04-15T00:00:00Z",
  insufficientHistory: false,
  weekly: [
    week({ targetLabel: "セブンイレブン", spentJpy: 2000, progressPct: 29 }),
    week({
      targetLabel: "Amazon",
      targetId: "Amazon",
      thresholdJpy: 5000,
      spentJpy: 4200,
      progressPct: 84,
      status: "warning",
    }),
    week({
      targetLabel: "成城石井",
      targetId: "成城石井",
      thresholdJpy: 3500,
      spentJpy: 4800,
      progressPct: 137,
      status: "failed",
    }),
  ],
  monthly: [
    month({ targetLabel: "食費" }),
    month({
      targetId: "cat-shop",
      targetLabel: "買い物",
      thresholdJpy: 30000,
      spentJpy: 22000,
      progressPct: 73,
      status: "warning",
    }),
  ],
};

const meta: Meta<typeof QuestList> = {
  title: "Features/Insights/Quests/QuestList",
  component: QuestList,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof QuestList>;

export const Typical: Story = {
  args: { data: typical },
};

export const InsufficientHistory: Story = {
  args: {
    data: {
      generatedAt: "2026-04-15T00:00:00Z",
      insufficientHistory: true,
      weekly: [],
      monthly: [],
    },
  },
};

export const AllOnTrack: Story = {
  args: {
    data: {
      ...typical,
      weekly: typical.weekly.map((q) => ({
        ...q,
        spentJpy: 1000,
        progressPct: 14,
        status: "on_track" as const,
      })),
      monthly: typical.monthly.map((q) => ({
        ...q,
        spentJpy: 5000,
        progressPct: 12,
        status: "on_track" as const,
      })),
    },
  },
};
