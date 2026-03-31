import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "AssetLensのプライバシーポリシーです。個人情報の取り扱いについて説明しています。",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        プライバシーポリシー
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        最終更新日: 2026年3月31日
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. 収集する情報</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            本サービスでは、以下の情報を収集する場合があります。
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>アカウント情報</strong>:
              メールアドレス、表示名、プロフィール画像
            </li>
            <li>
              <strong>認証情報</strong>:
              パスキー（WebAuthn）の公開鍵情報（秘密鍵はデバイスに保存されます）
            </li>
            <li>
              <strong>利用データ</strong>:
              取引記録、カテゴリ分類、予算設定、サブスクリプション情報
            </li>
            <li>
              <strong>技術情報</strong>:
              ブラウザ種別、IPアドレス（ログイン時のセキュリティ目的）
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. 情報の利用目的</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            収集した情報は、以下の目的で利用します。
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>本サービスの提供・運営・改善</li>
            <li>ユーザーアカウントの管理と認証</li>
            <li>収支データの保存と分析機能の提供</li>
            <li>サービスに関する重要なお知らせの送信</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. 情報の第三者提供</h2>
          <p className="text-muted-foreground leading-relaxed">
            運営者は、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供しません。
            ただし、以下の場合はこの限りではありません。
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づき開示が必要な場合</li>
            <li>
              サービス提供に必要な範囲でのインフラパートナーへの委託（データベースホスティング等）
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            4. データの保管と安全管理
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            ユーザーデータは暗号化された通信（TLS）を通じて送受信され、セキュアなクラウドインフラストラクチャに保管されます。
            パスワードはハッシュ化して保存され、平文での保存は行いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. データの削除</h2>
          <p className="text-muted-foreground leading-relaxed">
            ユーザーはいつでも設定画面からアカウントを削除できます。
            アカウント削除時には、関連するすべてのデータ（取引記録、カテゴリ、予算設定等）が完全に削除されます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Cookieの使用</h2>
          <p className="text-muted-foreground leading-relaxed">
            本サービスでは、セッション管理およびテーマ設定の保持のためにCookieを使用します。
            これらのCookieは本サービスの正常な動作に必要なものです。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. ポリシーの変更</h2>
          <p className="text-muted-foreground leading-relaxed">
            本ポリシーは予告なく変更されることがあります。
            重要な変更がある場合は、本ページにて通知します。
          </p>
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
