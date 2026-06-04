import { NextResponse } from "next/server";

/**
 * Markdown representations of public pages for AI agent consumption.
 * Returned when clients request Accept: text/markdown (RFC content negotiation).
 *
 * Only static/public pages are supported — authenticated pages are excluded
 * since agents cannot access user-specific data.
 */
const MARKDOWN_PAGES: Record<string, () => string> = {
  "/": () => `# AssetLens - スマート家計管理

AssetLens は、収支を記録・分析して家計を最適化するパーソナルファイナンスアプリです。

## 特徴

- **直感的なグラフ**: 入力したデータは自動的に美しいグラフに変換。ひと目で資産状況を把握できます。
- **パスキー認証**: パスワード不要。指紋や顔認証で安全かつ瞬時にログインできます。
- **シンプル設計**: 必要な機能だけを厳選。毎日の記録が苦にならない洗練されたUIを提供します。
- **予算管理**: カテゴリ別に予算を設定し、進捗をリアルタイムで追跡。使いすぎを防ぎます。
- **セキュリティ**: エンドツーエンドの暗号化通信。あなたの金融データを強固に保護します。
- **サブスク管理**: 月額サービスの支出を一覧管理。更新日にリマインドで見落とし防止。

## はじめかた

1. **アカウント作成** — メールアドレスまたはパスキーで数秒でアカウント作成
2. **取引を記録** — 収入・支出をカテゴリ別に記録。レシート読取で入力も簡単
3. **分析・改善** — グラフで支出傾向を把握。予算管理で無駄を削減

## リンク

- [無料で始める](/login)
- [プライバシーポリシー](/privacy)
- [利用規約](/terms)
- [お問い合わせ](/contact)
`,
};

/**
 * Get the markdown representation of a public page.
 * Returns null if the page has no markdown version.
 */
export function getMarkdownForPath(pathname: string): string | null {
  const generator = MARKDOWN_PAGES[pathname];
  return generator ? generator() : null;
}

/**
 * Build a NextResponse with text/markdown content type.
 */
export function markdownResponse(content: string): NextResponse {
  // Rough token estimate: split by whitespace
  const tokenEstimate = Math.ceil(content.length / 4);

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokenEstimate),
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      Vary: "Accept",
    },
  });
}
