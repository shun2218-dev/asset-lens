import type { Meta, StoryObj } from "@storybook/react";
import { StoreRanking } from "./store-ranking";

const meta: Meta<typeof StoreRanking> = {
  title: "Features/Dashboard/Widgets/StoreRanking",
  component: StoreRanking,
};

export default meta;
type Story = StoryObj<typeof StoreRanking>;

export const Default: Story = {
  args: {
    data: [
      { storeName: "スーパーA", totalAmount: 18000 },
      { storeName: "コンビニB", totalAmount: 12000 },
      { storeName: "スタバ", totalAmount: 8000 },
      { storeName: "ドラッグストア", totalAmount: 5000 },
      { storeName: "ユニクロ", totalAmount: 3000 },
    ],
  },
};

export const Empty: Story = {
  args: { data: [] },
};
