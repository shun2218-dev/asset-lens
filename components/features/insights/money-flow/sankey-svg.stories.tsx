import type { Meta, StoryObj } from "@storybook/react";
import { SankeySvg } from "./sankey-svg";

const meta: Meta<typeof SankeySvg> = {
  title: "Features/Insights/MoneyFlow/SankeySvg",
  component: SankeySvg,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Pure SVG renderer for the in-house 3-column sankey layout. Receives nodes / links plus width and height; the parent component owns hover state.",
      },
    },
  },
  args: {
    width: 720,
    height: 380,
    ariaLabel: "予算からカテゴリ・店舗までの資金フロー",
  },
};
export default meta;
type Story = StoryObj<typeof SankeySvg>;

const ROOT = "__root__";

export const Typical: Story = {
  args: {
    nodes: [
      { id: ROOT, level: 0, label: "予算", color: "#6366f1" },
      { id: "cat-food", level: 1, label: "食費", color: "#f97316" },
      { id: "cat-shop", level: 1, label: "買い物", color: "#ec4899" },
      { id: "cat-trans", level: 1, label: "交通費", color: "#3b82f6" },
      {
        id: "store:cat-food:seven",
        level: 2,
        parentId: "cat-food",
        label: "セブンイレブン",
        color: "#f97316",
      },
      {
        id: "store:cat-food:seijo",
        level: 2,
        parentId: "cat-food",
        label: "成城石井",
        color: "#f97316",
      },
      {
        id: "store:cat-shop:amazon",
        level: 2,
        parentId: "cat-shop",
        label: "Amazon",
        color: "#ec4899",
      },
      {
        id: "store:cat-trans:metro",
        level: 2,
        parentId: "cat-trans",
        label: "東京メトロ",
        color: "#3b82f6",
      },
    ],
    links: [
      { source: ROOT, target: "cat-food", value: 45000 },
      { source: ROOT, target: "cat-shop", value: 30000 },
      { source: ROOT, target: "cat-trans", value: 12000 },
      { source: "cat-food", target: "store:cat-food:seven", value: 28000 },
      { source: "cat-food", target: "store:cat-food:seijo", value: 17000 },
      { source: "cat-shop", target: "store:cat-shop:amazon", value: 30000 },
      { source: "cat-trans", target: "store:cat-trans:metro", value: 12000 },
    ],
  },
};

export const SingleCategory: Story = {
  args: {
    nodes: [
      { id: ROOT, level: 0, label: "支出合計", color: "#6366f1" },
      { id: "cat-food", level: 1, label: "食費", color: "#f97316" },
      {
        id: "store:cat-food:seven",
        level: 2,
        parentId: "cat-food",
        label: "セブンイレブン",
        color: "#f97316",
      },
    ],
    links: [
      { source: ROOT, target: "cat-food", value: 8000 },
      { source: "cat-food", target: "store:cat-food:seven", value: 8000 },
    ],
  },
};

export const Empty: Story = {
  args: {
    nodes: [],
    links: [],
  },
};
