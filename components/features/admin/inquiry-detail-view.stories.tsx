import type { Meta, StoryObj } from "@storybook/react";
import type { SelectContactInquiry, SelectInquiryReply } from "@/db/schema";
import { InquiryDetailView } from "./inquiry-detail-view";

const meta: Meta<typeof InquiryDetailView> = {
  title: "Features/Admin/InquiryDetailView",
  component: InquiryDetailView,
  parameters: {
    nextjs: { appDirectory: true },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InquiryDetailView>;

const mockInquiry: SelectContactInquiry = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "田中太郎",
  email: "tanaka@example.com",
  category: "question",
  message:
    "パスキーの登録方法がわかりません。\n\n設定画面を開いたのですが、「パスキーを追加」のようなボタンが見当たりませんでした。\n\nブラウザはChrome最新版を使っています。\nOSはWindows 11です。\n\nよろしくお願いいたします。",
  status: "new",
  note: null,
  createdAt: new Date("2026-04-01T10:00:00"),
  updatedAt: new Date("2026-04-01T10:00:00"),
};

const mockReplies: SelectInquiryReply[] = [
  {
    id: "r1",
    inquiryId: mockInquiry.id,
    direction: "outbound",
    senderEmail: "admin@asset-lens.com",
    subject: "Re: ご質問について",
    body: "お問い合わせいただきありがとうございます。\n\nパスキーの追加ボタンは「設定 > セキュリティ」タブ内にございます。\n\nもし見つからない場合はお気軽にお問い合わせください。",
    createdAt: new Date("2026-04-01T14:00:00"),
  },
  {
    id: "r2",
    inquiryId: mockInquiry.id,
    direction: "inbound",
    senderEmail: "tanaka@example.com",
    subject: "Re: ご質問について",
    body: "ご回答ありがとうございます。\n設定 > セキュリティタブを確認したところ、パスキーの追加ボタンを見つけることができました。\n無事解決しました。",
    createdAt: new Date("2026-04-02T10:30:00"),
  },
];

export const NewInquiry: Story = {
  args: { inquiry: mockInquiry, replies: [] },
};

export const InProgressWithNote: Story = {
  args: {
    inquiry: {
      ...mockInquiry,
      status: "in_progress",
      note: "パスキー機能はv2.29.0で実装予定。リリース後にフォローアップ予定。",
    },
    replies: [],
  },
};

export const WithReplyHistory: Story = {
  args: {
    inquiry: {
      ...mockInquiry,
      status: "in_progress",
      note: "初回返信済み",
    },
    replies: mockReplies,
  },
};

export const Resolved: Story = {
  args: {
    inquiry: {
      ...mockInquiry,
      status: "resolved",
      note: "v2.29.0リリースに合わせて通知メール送信済み",
    },
    replies: mockReplies,
  },
};

export const BugReport: Story = {
  args: {
    inquiry: {
      ...mockInquiry,
      category: "bug",
      message:
        "CSVエクスポートすると文字化けが発生します。\nExcelで開くとShift_JISで読み込まれているようです。\nUTF-8 BOM付きで出力してほしいです。",
      status: "in_progress",
      note: "UTF-8 BOM対応のPR作成中",
    },
    replies: [],
  },
};
