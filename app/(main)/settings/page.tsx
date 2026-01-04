import { ChevronRight, FileText, Shield, UserCircle } from "lucide-react";
import Link from "next/link";
import { PasskeySettings } from "@/components/auth/passkey-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireAuth } from "@/lib/auth/auth-guard";

export default async function SettingsPage() {
  const session = await requireAuth();

  return (
    <main className="container max-w-6xl px-4 py-10 space-y-8 mx-auto min-h-screen">
      <div>
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-muted-foreground">
          アカウント設定とアプリケーションの管理
        </p>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px]">
        {/* メインコンテンツエリア */}
        <div className="space-y-6">
          {/* プロフィール簡易表示（編集機能は別途作る想定） */}
          <Card>
            <CardHeader>
              <CardTitle>プロフィール</CardTitle>
              <CardDescription>基本情報の確認</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 text-sm">
                <span className="font-medium text-muted-foreground">名前</span>
                <span className="col-span-2">{session.user.name}</span>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <span className="font-medium text-muted-foreground">
                  メール
                </span>
                <span className="col-span-2">{session.user.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* セキュリティ (Passkey) */}
          <section id="security">
            <PasskeySettings />
          </section>

          {/* その他の設定セクション（例） */}
          <Card>
            <CardHeader>
              <CardTitle>データ管理</CardTitle>
              <CardDescription>エクスポートやリセット</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" disabled>
                <FileText className="mr-2 h-4 w-4" />
                データをCSVでエクスポート (準備中)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* サイドバーナビゲーション (ページ内リンクまたは別ページへのリンク) */}
        <aside className="hidden md:block">
          <nav className="flex flex-col gap-2 sticky top-24">
            <h3 className="font-semibold mb-2 px-2">メニュー</h3>

            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start">
                <UserCircle className="mr-2 h-4 w-4" />
                プロフィール詳細
              </Button>
            </Link>

            <Link href="/settings#security">
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                セキュリティ
              </Button>
            </Link>

            <Link href="/transactions">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                取引管理へ
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </nav>
        </aside>
      </div>
    </main>
  );
}
