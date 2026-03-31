import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "AssetLensの利用規約です。本サービスのご利用にあたっての条件を定めています。",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="text-3xl font-bold tracking-tight mb-8">利用規約</h1>
      <p className="text-sm text-muted-foreground mb-8">
        最終更新日: 2026年3月31日
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">第1条（適用）</h2>
          <p className="text-muted-foreground leading-relaxed">
            本利用規約（以下「本規約」）は、AssetLens（以下「本サービス」）の利用に関する条件を定めるものです。
            ユーザーは本規約に同意した上で本サービスを利用するものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">第2条（アカウント）</h2>
          <p className="text-muted-foreground leading-relaxed">
            ユーザーは、本サービスの利用にあたり、正確な情報を提供してアカウントを作成するものとします。
            アカウント情報の管理はユーザーの責任において行うものとし、第三者への譲渡・貸与はできません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">第3条（禁止事項）</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            ユーザーは、以下の行為を行ってはなりません。
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>法令または公序良俗に違反する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>他のユーザーの情報を不正に取得する行為</li>
            <li>本サービスを不正な目的で利用する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            第4条（サービスの変更・停止）
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            運営者は、ユーザーに事前に通知することなく、本サービスの内容を変更し、または本サービスの提供を停止・中断することができるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">第5条（免責事項）</h2>
          <p className="text-muted-foreground leading-relaxed">
            運営者は、本サービスに起因してユーザーに生じたあらゆる損害について、一切の責任を負いません。
            本サービスで提供される情報は、財務アドバイスを構成するものではありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">第6条（規約の変更）</h2>
          <p className="text-muted-foreground leading-relaxed">
            運営者は、必要と判断した場合、ユーザーに通知することなく本規約を変更できるものとします。
            変更後の規約は、本ページに掲載した時点から効力を生じるものとします。
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
