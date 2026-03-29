"use client";

import type { Session } from "better-auth";
import {
  AlertTriangle,
  FileText,
  Shield,
  Store,
} from "lucide-react";
import { PasskeySettings } from "@/components/features/auth/passkey-settings";
import { PasswordSettings } from "@/components/features/auth/password-settings";
import { DeleteAccountButton } from "@/components/features/settings/delete-account-button";
import { ExportButton } from "@/components/features/settings/export-button";
import { ImportButton } from "@/components/features/settings/import-button";
import { StoreNameMigrationTool } from "@/components/features/settings/store-name-migration-tool";
import { SubscriptionList } from "@/components/features/subscription/subscription-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { subscription } from "@/db/schema";

type SelectSubscription = typeof subscription.$inferSelect;

// ... existing imports ...

interface SettingsViewProps {
  session: {
    user: {
      name: string;
      email: string;
      image?: string | null;
    };
  };
  subscriptions: SelectSubscription[];
}

export function SettingsView({ session, subscriptions }: SettingsViewProps) {
  return (
    <main className="container max-w-5xl px-4 py-10 space-y-8 mx-auto min-h-screen">
      <div>
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-muted-foreground">
          アカウント設定とサブスクリプション管理
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-150">
          <TabsTrigger value="account">アカウント</TabsTrigger>
          <TabsTrigger value="data">データ管理</TabsTrigger>
          <TabsTrigger value="subscription">サブスクリプション</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          {/* ... security ... */}

          {/* セキュリティ */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">セキュリティ</h3>
            </div>
            <PasskeySettings />
            <PasswordSettings />
          </section>



          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                この操作は取り消せません。ご注意ください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-destructive">
                    アカウント削除
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    アカウントと関連データを完全に削除します
                  </p>
                </div>
                <DeleteAccountButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- タブ: データ管理 --- */}
        <TabsContent value="data" className="space-y-6">
          {/* データ入出力 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                データ入出力
              </CardTitle>
              <CardDescription>データのエクスポート・インポート</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <ExportButton />
                <ImportButton />
              </div>
            </CardContent>
          </Card>

          {/* 店舗名一括設定ツール */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                店舗名の一括設定
              </CardTitle>
              <CardDescription>
                用途欄から店舗名を抽出して設定します。半角スペースの前を店舗名、後を用途として分割します。プレビューを確認してから適用してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoreNameMigrationTool />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- タブ: サブスクリプション管理 --- */}
        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionList subscriptions={subscriptions} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
