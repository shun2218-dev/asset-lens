import { ArrowRight, BarChart3, Fingerprint, Zap } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";
import { requireGuest } from "@/lib/auth/auth-guard";

export default async function LandingPage() {
  // サーバーサイドでセッションを取得してボタンを出し分ける
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  await requireGuest();

  return (
    <main className="flex flex-col min-h-screen">
      {/* --- メインビジュアル (Hero Section) --- */}
      <section className="flex-1 flex flex-col items-center justify-center py-24 md:py-32 space-y-8 text-center px-4 bg-linear-to-b from-background to-muted/20">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow mb-4">
            New
            <span className="ml-2 font-normal text-primary-foreground/80">
              Passkey認証に対応しました
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
            資産管理を、
            <br className="md:hidden" />
            もっとシンプルに。
          </h1>

          <p className="mx-auto max-w-175 text-muted-foreground text-lg md:text-xl leading-relaxed">
            AssetLensは、あなたの収支を可視化し、未来への投資をサポートする
            <br className="hidden md:inline" />
            シンプルでセキュアな家計簿アプリケーションです。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {session ? (
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/dashboard">
                ダッシュボードを開く
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/login">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base"
            asChild
          >
            <Link href="#features">機能を見る</Link>
          </Button>
        </div>
      </section>

      {/* --- 特徴 (Features) --- */}
      <section id="features" className="container mx-auto px-4 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-3 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm">
            <div className="p-3 bg-primary/10 rounded-full">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">直感的なグラフ</h3>
            <p className="text-muted-foreground">
              複雑な設定は不要。入力したデータは自動的に美しいグラフに変換され、
              ひと目で資産状況を把握できます。
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm">
            <div className="p-3 bg-primary/10 rounded-full">
              <Fingerprint className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">パスキー認証</h3>
            <p className="text-muted-foreground">
              パスワードはもう不要です。指紋や顔認証を使って、
              安全かつ瞬時にログインできます。
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm">
            <div className="p-3 bg-primary/10 rounded-full">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">シンプル設計</h3>
            <p className="text-muted-foreground">
              必要な機能だけを厳選。
              毎日の記録が苦にならない、洗練されたUIを提供します。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
