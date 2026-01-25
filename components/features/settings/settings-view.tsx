"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  CreditCard,
  FileText,
  Shield,
  UserCircle,
} from "lucide-react";
import type { Session } from "better-auth";
import { PasskeySettings } from "@/components/features/auth/passkey-settings";
import { PasswordSettings } from "@/components/features/auth/password-settings";
import { DeleteAccountButton } from "@/components/features/settings/delete-account-button";
import { ExportButton } from "@/components/features/settings/export-button";
import { ImportButton } from "@/components/features/settings/import-button";
import { SubscriptionForm } from "@/components/features/subscription/subscription-form";
import { Badge } from "@/components/ui/badge";
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

interface SettingsViewProps {
  session: {
    user: {
        name: string;
        email: string;
    }
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
        <TabsList className="grid w-full grid-cols-2 lg:w-100">
          <TabsTrigger value="account">アカウント</TabsTrigger>
          <TabsTrigger value="subscription">サブスクリプション</TabsTrigger>
        </TabsList>

        {/* --- タブ1: アカウント設定 (既存機能を移動) --- */}
        <TabsContent value="account" className="space-y-6">
          {/* プロフィール */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                プロフィール
              </CardTitle>
              <CardDescription>基本情報の確認</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-muted-foreground">名前</span>
                <span className="md:col-span-2 font-medium">
                  {session.user.name}
                </span>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-muted-foreground">
                  メール
                </span>
                <span className="md:col-span-2 font-medium">
                  {session.user.email}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* セキュリティ */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">セキュリティ</h3>
            </div>
            <PasskeySettings />
            <PasswordSettings />
          </section>

          {/* データ管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                データ管理
              </CardTitle>
              <CardDescription>データの入出力</CardDescription>
            </CardHeader>
            <CardContent>
              <CardContent className="flex flex-wrap gap-4">
                <ExportButton />
                <ImportButton />
              </CardContent>
            </CardContent>
          </Card>

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

        {/* --- タブ2: サブスクリプション管理 (新規追加) --- */}
        <TabsContent value="subscription" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
            {/* 左側: 登録フォーム (3カラム分) */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    新規登録
                  </CardTitle>
                  <CardDescription>
                    定期支払いのサービスを登録します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionForm />
                </CardContent>
              </Card>
            </div>

            {/* 右側: 一覧リスト (4カラム分) */}
            <div className="lg:col-span-4">
              <Card className="h-full border-dashed lg:border-solid">
                <CardHeader>
                  <CardTitle>登録済みリスト</CardTitle>
                  <CardDescription>
                    登録中のサブスクリプション一覧
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                      <CreditCard className="h-10 w-10 mb-2 opacity-20" />
                      <p>登録されているサブスクリプションはありません</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{sub.name}</span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 h-5"
                              >
                                {sub.billingCycle === "monthly"
                                  ? "月額"
                                  : "年額"}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex gap-2">
                              <span>
                                次回:{" "}
                                {format(sub.nextPaymentDate, "yyyy/MM/dd")}
                              </span>
                              <span className="text-muted-foreground/50">
                                |
                              </span>
                              <span>{sub.category}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              ¥{sub.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
