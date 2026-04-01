"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ContactInput,
  sendContactMessage,
} from "@/app/actions/contact/send";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  { value: "question", label: "質問・お問い合わせ" },
  { value: "bug", label: "バグ・不具合の報告" },
  { value: "feature", label: "機能のリクエスト" },
  { value: "other", label: "その他" },
] as const;

export function ContactForm() {
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const fd = new FormData(e.currentTarget);
    const input: ContactInput = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      category: fd.get("category") as ContactInput["category"],
      message: fd.get("message") as string,
    };

    // reCAPTCHA v3 token (if configured)
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && window.grecaptcha) {
      try {
        const token = await window.grecaptcha.execute(siteKey, {
          action: "contact",
        });
        input.recaptchaToken = token;
      } catch {
        // Continue without token
      }
    }

    const result = await sendContactMessage(input);

    if (result.success) {
      setSent(true);
      toast.success("お問い合わせを送信しました");
    } else {
      toast.error(result.error || "送信に失敗しました");
    }

    setIsPending(false);
  }

  if (sent) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Send className="h-5 w-5 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold">送信完了</h3>
        <p className="text-sm text-muted-foreground">
          お問い合わせありがとうございます。通常2〜3営業日以内にご返信いたします。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-name">お名前</Label>
          <Input
            id="contact-name"
            name="name"
            required
            maxLength={100}
            placeholder="山田 太郎"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">メールアドレス</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-category">カテゴリ</Label>
        <Select name="category" required defaultValue="question">
          <SelectTrigger id="contact-category">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">お問い合わせ内容</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          placeholder="お問い合わせ内容をご記入ください..."
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        送信する
      </Button>
    </form>
  );
}
