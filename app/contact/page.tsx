import { HelpCircle, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/features/contact/contact-form";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "AssetLensに関するお問い合わせ・ご質問・ご意見はこちらからお寄せください。",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="text-3xl font-bold tracking-tight mb-8">お問い合わせ</h1>

      <div className="space-y-8">
        {/* Contact Form */}
        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-primary/10 rounded-full shrink-0">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                フォームからお問い合わせ
              </h2>
              <p className="text-sm text-muted-foreground">
                通常2〜3営業日以内にご返信いたします。
              </p>
            </div>
          </div>
          <ContactForm />
        </section>

        {/* FAQ */}
        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-primary/10 rounded-full shrink-0">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">よくある質問</h2>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="font-medium mb-1">無料で使えますか？</h3>
              <p className="text-sm text-muted-foreground">
                はい、AssetLensは無料でご利用いただけます。すべての機能を追加料金なしでお使いいただけます。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">
                データはどこに保存されますか？
              </h3>
              <p className="text-sm text-muted-foreground">
                データは安全なクラウドデータベースに暗号化して保存されます。お客様のデータは第三者と共有されることはありません。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">アカウントを削除したいです</h3>
              <p className="text-sm text-muted-foreground">
                設定画面の「アカウント削除」ボタンから削除できます。削除後のデータ復元はできませんのでご注意ください。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">
                データのエクスポートはできますか？
              </h3>
              <p className="text-sm text-muted-foreground">
                はい、CSVエクスポートに対応しています。設定画面からダウンロードできます。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">パスキーを紛失しました</h3>
              <p className="text-sm text-muted-foreground">
                メールアドレスとパスワードでもログインできます。ログイン後、設定画面から新しいパスキーを登録してください。
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← トップページに戻る
        </Link>
      </div>
    </div>
  );
}
