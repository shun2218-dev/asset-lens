import type { Meta, StoryObj } from "@storybook/react";
import type { MoneyFlowResult } from "@/app/actions/analysis/get-money-flow";
import { MoneyFlowCard } from "./money-flow-card";

const ROOT = "__root__";

const typicalStoreView = {
  nodes: [
    { id: ROOT, level: 0 as const, label: "今月の予算", color: "#6366f1" },
    { id: "cat-food", level: 1 as const, label: "食費", color: "#f97316" },
    { id: "cat-shop", level: 1 as const, label: "買い物", color: "#ec4899" },
    {
      id: "store:cat-food:seven",
      level: 2 as const,
      parentId: "cat-food",
      label: "セブンイレブン",
      color: "#f97316",
    },
    {
      id: "store:cat-food:seijo",
      level: 2 as const,
      parentId: "cat-food",
      label: "成城石井",
      color: "#f97316",
    },
    {
      id: "store:cat-shop:amazon",
      level: 2 as const,
      parentId: "cat-shop",
      label: "Amazon",
      color: "#ec4899",
    },
  ],
  links: [
    { source: ROOT, target: "cat-food", value: 45000 },
    { source: ROOT, target: "cat-shop", value: 30000 },
    { source: "cat-food", target: "store:cat-food:seven", value: 28000 },
    { source: "cat-food", target: "store:cat-food:seijo", value: 17000 },
    { source: "cat-shop", target: "store:cat-shop:amazon", value: 30000 },
  ],
};

const typicalTagView = {
  nodes: [
    { id: ROOT, level: 0 as const, label: "今月の予算", color: "#6366f1" },
    { id: "cat-food", level: 1 as const, label: "食費", color: "#f97316" },
    {
      id: "tag:cat-food:t1",
      level: 2 as const,
      parentId: "cat-food",
      label: "ランチ",
      color: "#f97316",
    },
    {
      id: "tag:cat-food:t2",
      level: 2 as const,
      parentId: "cat-food",
      label: "外食",
      color: "#f97316",
    },
  ],
  links: [
    { source: ROOT, target: "cat-food", value: 45000 },
    { source: "cat-food", target: "tag:cat-food:t1", value: 25000 },
    { source: "cat-food", target: "tag:cat-food:t2", value: 20000 },
  ],
};

const typical: MoneyFlowResult = {
  month: "2026-04",
  rootKind: "budget",
  rootAmount: 200000,
  totalExpense: 75000,
  storeView: typicalStoreView,
  tagView: typicalTagView,
};

const meta: Meta<typeof MoneyFlowCard> = {
  title: "Features/Insights/MoneyFlow/MoneyFlowCard",
  component: MoneyFlowCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    a11y: {
      config: {
        rules: [
          {
            // Radix Tabs generates aria-controls for TabsContent, but this
            // component intentionally renders the chart outside Tabs and uses
            // TabsList only as a styled segmented control, so the aria-controls
            // target does not exist.
            id: "aria-valid-attr-value",
            enabled: false,
          },
        ],
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof MoneyFlowCard>;

export const BudgetAnchored: Story = {
  args: { data: typical },
};

export const ExpenseAnchored: Story = {
  args: {
    data: {
      ...typical,
      rootKind: "expense",
      rootAmount: typical.totalExpense,
    },
  },
};

export const Empty: Story = {
  args: {
    data: {
      month: "2026-04",
      rootKind: "expense",
      rootAmount: 0,
      totalExpense: 0,
      storeView: { nodes: [], links: [] },
      tagView: { nodes: [], links: [] },
    },
  },
};
