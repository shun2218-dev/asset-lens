"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, Mail, Save, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateInquiryStatus } from "@/app/actions/contact/update-status";
import {
  CATEGORY_LABELS,
  InquiryStatusBadge,
  STATUS_OPTIONS,
} from "@/components/features/admin/inquiry-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { SelectContactInquiry } from "@/db/schema";

interface InquiryDetailViewProps {
  inquiry: SelectContactInquiry;
}

export function InquiryDetailView({ inquiry }: InquiryDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(inquiry.status);
  const [note, setNote] = useState(inquiry.note ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      const result = await updateInquiryStatus({
        id: inquiry.id,
        status: status as "new" | "in_progress" | "resolved" | "closed",
        note: note || undefined,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/inquiries"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        一覧に戻る
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">お問い合わせ内容</CardTitle>
                <InquiryStatusBadge status={inquiry.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">名前</p>
                    <p className="text-sm font-medium">{inquiry.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">メール</p>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {inquiry.email}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">カテゴリ</p>
                <p className="text-sm">
                  {CATEGORY_LABELS[inquiry.category] ?? inquiry.category}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground mb-2">メッセージ</p>
                <div className="rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                  {inquiry.message}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                受信日時:{" "}
                {format(new Date(inquiry.createdAt), "yyyy/MM/dd HH:mm", {
                  locale: ja,
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Status & Note */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ステータス管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="inquiry-status"
                  className="text-sm font-medium mb-1.5 block"
                >
                  ステータス
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="inquiry-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="inquiry-note"
                  className="text-sm font-medium mb-1.5 block"
                >
                  管理メモ
                </label>
                <Textarea
                  id="inquiry-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="対応メモを記入..."
                  rows={4}
                  maxLength={2000}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isPending}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saved ? "保存しました ✓" : isPending ? "保存中..." : "保存"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
