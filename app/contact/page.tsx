import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full shrink-0">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">
                メールでのお問い合わせ
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ご質問、ご意見、不具合の報告など、お気軽にお問い合わせください。
                通常2〜3営業日以内にご返信いたします。
              </p>
              <a
                href="mailto:support@asset-lens.app"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <Mail className="h-4 w-4" />
                support@asset-lens.app
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">よくある質問</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">アカウントを削除したいです</h3>
              <p className="text-sm text-muted-foreground">
                設定画面の「アカウント削除」ボタンから削除できます。削除後のデータ復元はできません。
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">
                データのエクスポートはできますか？
              </h3>
              <p className="text-sm text-muted-foreground">
                現在开発中の機能です。今後のアップデートでCSV/PDFエクスポートに対応予定です。
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

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">バグの報告</h2>
          <p className="text-muted-foreground leading-relaxed">
            不具合を見つけた場合は、以下の情報を添えてご報告いただけると迅速に対応できます。
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground mt-3">
            <li>発生した操作の手順</li>
            <li>期待される動作と実際の動作</li>
            <li>ブラウザの種類とバージョン</li>
            <li>スクリーンショット（可能であれば）</li>
          </ul>
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
