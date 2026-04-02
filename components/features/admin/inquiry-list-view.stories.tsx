import type { Meta, StoryObj } from "@storybook/react";
import type { SelectContactInquiry } from "@/db/schema";
import { InquiryListView } from "./inquiry-list-view";

const meta: Meta<typeof InquiryListView> = {
  title: "Features/Admin/InquiryListView",
  component: InquiryListView,
  parameters: {
    nextjs: { appDirectory: true },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InquiryListView>;

const mockItems: SelectContactInquiry[] = [
  {
    id: "1",
    name: "田中太郎",
    email: "tanaka@example.com",
    category: "question",
    message:
      "パスキーの登録方法がわかりません。設定画面にボタンが見つかりませんでした。",
    status: "new",
    note: null,
    createdAt: new Date("2026-04-01T10:00:00"),
    updatedAt: new Date("2026-04-01T10:00:00"),
  },
  {
    id: "2",
    name: "佐藤花子",
    email: "sato@example.com",
    category: "bug",
    message:
      "CSVエクスポートすると文字化けが発生します。UTF-8で出力してほしいです。",
    status: "in_progress",
    note: "Investigating encoding issue",
    createdAt: new Date("2026-03-30T14:30:00"),
    updatedAt: new Date("2026-03-31T09:00:00"),
  },
  {
    id: "3",
    name: "鈴木一郎",
    email: "suzuki@example.com",
    category: "feature",
    message: "月別の予算だけでなく、週別の予算設定もできるようにしてほしい。",
    status: "resolved",
    note: "Added to backlog",
    createdAt: new Date("2026-03-28T08:00:00"),
    updatedAt: new Date("2026-03-29T16:00:00"),
  },
  {
    id: "4",
    name: "山田二郎",
    email: "yamada@example.com",
    category: "other",
    message: "素晴らしいアプリですね！これからも応援しています。",
    status: "closed",
    note: null,
    createdAt: new Date("2026-03-25T12:00:00"),
    updatedAt: new Date("2026-03-25T12:00:00"),
  },
];

export const Default: Story = {
  args: {
    items: mockItems,
    totalCount: 4,
    totalPages: 1,
    currentPage: 1,
  },
};

export const WithPagination: Story = {
  args: {
    items: mockItems,
    totalCount: 45,
    totalPages: 3,
    currentPage: 2,
  },
};

export const Filtered: Story = {
  args: {
    items: mockItems.filter((i) => i.status === "new"),
    totalCount: 1,
    totalPages: 1,
    currentPage: 1,
    currentStatus: "new",
  },
};

export const Empty: Story = {
  args: {
    items: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  },
};

export const EmptyFiltered: Story = {
  args: {
    items: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    currentStatus: "resolved",
  },
};
