import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Fingerprint,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { requireGuest } from "@/lib/auth/guard";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  await requireGuest();

  return (
    <main className="flex flex-col min-h-screen overflow-hidden">
      {/* --- Hero Section --- */}
      <section className="relative flex-1 flex flex-col items-center justify-center py-24 md:py-36 space-y-10 text-center px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] -z-10 bg-[radial-gradient(circle,hsl(var(--primary)/0.08),transparent_70%)] blur-3xl" />

        <div className="space-y-6 max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Passkey認証に対応しました
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/50">
              資産管理を、
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/60">
              もっとシンプルに。
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl leading-relaxed">
            AssetLensは、あなたの収支を可視化し、未来への投資をサポートする
            <br className="hidden md:inline" />
            シンプルでセキュアな家計簿アプリケーションです。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up">
          {session ? (
            <Button
              asChild
              size="lg"
              className="h-13 px-10 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Link href="/dashboard">
                ダッシュボードを開く
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="h-13 px-10 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <Link href="/login">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            className="h-13 px-10 text-base border-border/50 backdrop-blur-sm"
            asChild
          >
            <Link href="#features">機能を見る</Link>
          </Button>
        </div>

        {/* Dashboard Preview */}
        <div className="relative w-full max-w-4xl mx-auto mt-8 animate-fade-in-up stagger-2">
          <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-2xl shadow-black/5 p-1">
            <div className="rounded-lg bg-gradient-to-b from-muted/50 to-muted/20 p-8 md:p-12">
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="rounded-lg bg-card border p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">今月の収入</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    ¥350,000
                  </p>
                </div>
                <div className="rounded-lg bg-card border p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">今月の支出</p>
                  <p className="text-2xl font-bold text-rose-500">¥182,400</p>
                </div>
                <div className="rounded-lg bg-card border p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">収支バランス</p>
                  <p className="text-2xl font-bold text-primary">+¥167,600</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-card border p-4 h-32 flex items-end gap-1">
                  <div className="w-full flex items-end gap-1 h-20">
                    <div className="flex-1 bg-primary/20 rounded-t h-[40%]" />
                    <div className="flex-1 bg-primary/30 rounded-t h-[55%]" />
                    <div className="flex-1 bg-primary/40 rounded-t h-[70%]" />
                    <div className="flex-1 bg-primary/50 rounded-t h-[45%]" />
                    <div className="flex-1 bg-primary/60 rounded-t h-[80%]" />
                    <div className="flex-1 bg-primary rounded-t h-[65%]" />
                  </div>
                </div>
                <div className="rounded-lg bg-card border p-4 h-32 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-8 border-primary/30 border-t-primary border-r-primary animate-spin-slow" />
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-2xl rounded-2xl" />
        </div>
      </section>

      {/* --- How it works --- */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              3ステップで始められます
            </h2>
            <p className="text-muted-foreground text-lg">
              面倒な設定は不要。すぐに使い始められます。
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative flex flex-col items-center text-center space-y-4 animate-fade-in-up stagger-1">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25">
                1
              </div>
              <h3 className="text-lg font-bold">アカウント作成</h3>
              <p className="text-sm text-muted-foreground">
                メールアドレスまたはパスキーで
                <br />
                数秒でアカウント作成
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center space-y-4 animate-fade-in-up stagger-2">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25">
                2
              </div>
              <h3 className="text-lg font-bold">取引を記録</h3>
              <p className="text-sm text-muted-foreground">
                収入・支出をカテゴリ別に記録
                <br />
                レシート読取で入力も簡単
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center space-y-4 animate-fade-in-up stagger-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25">
                3
              </div>
              <h3 className="text-lg font-bold">分析・改善</h3>
              <p className="text-sm text-muted-foreground">
                グラフで支出傾向を把握
                <br />
                予算管理で無駄を削減
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section id="features" className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            必要な機能を、過不足なく
          </h2>
          <p className="text-muted-foreground text-lg">
            日々の家計管理に必要な機能をすべて揃えました。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <div className="group flex flex-col space-y-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-1">
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <BarChart3 className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold">直感的なグラフ</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              入力したデータは自動的に美しいグラフに変換。ひと目で資産状況を把握できます。
            </p>
          </div>

          <div className="group flex flex-col space-y-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-2">
            <div className="p-3 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Fingerprint className="h-7 w-7 text-violet-500" />
            </div>
            <h3 className="text-lg font-bold">パスキー認証</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              パスワード不要。指紋や顔認証で安全かつ瞬時にログインできます。
            </p>
          </div>

          <div className="group flex flex-col space-y-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Zap className="h-7 w-7 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold">シンプル設計</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              必要な機能だけを厳選。毎日の記録が苦にならない洗練されたUIを提供します。
            </p>
          </div>

          <div className="group flex flex-col space-y-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <TrendingUp className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold">予算管理</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              カテゴリ別に予算を設定し、進捗をリアルタイムで追跡。使いすぎを防ぎます。
            </p>
          </div>

          <div className="group flex flex-col space-y-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-5">
            <div className="p-3 bg-gradient-to-br from-rose-500/10 to-rose-500/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Shield className="h-7 w-7 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold">セキュリティ</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              エンドツーエンドの暗号化通信。あなたの金融データを強固に保護します。
            </p>
          </div>

          <div className="group flex flex-col space-y-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-6">
            <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-7 w-7 text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold">サブスク管理</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              月額サービスの支出を一覧管理。更新日にリマインドで見落とし防止。
            </p>
          </div>
        </div>
      </section>

      {/* --- Social Proof --- */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-extrabold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">無料で利用可能</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-extrabold text-primary">
                <span className="text-2xl">🔒</span> SSL
              </p>
              <p className="text-sm text-muted-foreground">暗号化通信で安全</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-extrabold text-primary">0件</p>
              <p className="text-sm text-muted-foreground">広告表示なし</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="container mx-auto px-4 text-center space-y-8 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            今日から家計管理を始めましょう
          </h2>
          <p className="text-muted-foreground text-lg">
            登録は無料。1分もかからずに始められます。
          </p>
          {session ? (
            <Button
              asChild
              size="lg"
              className="h-13 px-12 text-base font-semibold shadow-lg shadow-primary/25"
            >
              <Link href="/dashboard">
                ダッシュボードを開く
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="h-13 px-12 text-base font-semibold shadow-lg shadow-primary/25"
            >
              <Link href="/login">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
