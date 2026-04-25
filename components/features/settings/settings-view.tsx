"use client";

import {
  AlertTriangle,
  BookOpen,
  FileText,
  Shield,
  Store,
  Zap,
} from "lucide-react";
import { PasskeySettings } from "@/components/features/auth/passkey-settings";
import { PasswordSettings } from "@/components/features/auth/password-settings";
import { BudgetSettings } from "@/components/features/budget/budget-settings";
import { CategoryManager } from "@/components/features/category/category-manager";
import { ReplayTourButton } from "@/components/features/onboarding/replay-tour-button";
import { DeleteAccountButton } from "@/components/features/settings/delete-account-button";
import { ExportButton } from "@/components/features/settings/export-button";
import { ImportButton } from "@/components/features/settings/import-button";
import { StoreNameMigrationTool } from "@/components/features/settings/store-name-migration-tool";
import { StoreManager } from "@/components/features/store/store-manager";
import { SubscriptionList } from "@/components/features/subscription/subscription-list";
import { TemplateManager } from "@/components/features/template/template-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  SelectBudget,
  SelectCategory,
  SelectStore,
  SelectTransactionTemplate,
  subscription,
} from "@/db/schema";

type SelectSubscription = typeof subscription.$inferSelect;

interface BudgetWithCategory extends SelectBudget {
  category: SelectCategory | null;
}

interface SettingsViewProps {
  session: {
    user: {
      name: string;
      email: string;
      image?: string | null;
    };
  };
  subscriptions: SelectSubscription[];
  budgets: BudgetWithCategory[];
  categories: SelectCategory[];
  stores: SelectStore[];
  templates: SelectTransactionTemplate[];
}

export function SettingsView({
  // biome-ignore lint/correctness/noUnusedFunctionParameters: used for future profile display
  session,
  subscriptions,
  budgets,
  categories,
  stores,
  templates,
}: SettingsViewProps) {
  return (
    <main className="container max-w-5xl px-4 py-10 pb-24 md:pb-10 space-y-8 mx-auto min-h-screen overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">設定</h1>
        <p className="text-muted-foreground">
          アカウント設定とサブスクリプション管理
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="account" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <TabsList className="inline-flex w-max sm:grid sm:w-full sm:grid-cols-6">
            <TabsTrigger value="account">アカウント</TabsTrigger>
            <TabsTrigger value="category">カテゴリ</TabsTrigger>
            <TabsTrigger value="budget">予算</TabsTrigger>
            <TabsTrigger value="template">テンプレート</TabsTrigger>
            <TabsTrigger value="data">データ管理</TabsTrigger>
            <TabsTrigger value="subscription">サブスク</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="account" className="space-y-6">
          {/* ... security ... */}

          {/* セキュリティ */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium">セキュリティ</h2>
            </div>
            <PasskeySettings />
            <PasswordSettings />
          </section>

          {/* 使い方ガイド */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                使い方ガイド
              </CardTitle>
              <CardDescription>
                アプリの機能や操作方法を確認できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReplayTourButton />
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="space-y-0.5">
                  <h3 className="font-medium text-destructive">
                    アカウント削除
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    アカウントと関連データを完全に削除します
                  </p>
                </div>
                <DeleteAccountButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- タブ: カテゴリ管理 --- */}
        <TabsContent value="category" className="space-y-6">
          <CategoryManager categories={categories} />
        </TabsContent>

        {/* --- タブ: 予算管理 --- */}
        <TabsContent value="budget" className="space-y-6">
          <BudgetSettings budgets={budgets} categories={categories} />
        </TabsContent>

        {/* --- タブ: テンプレート管理 --- */}
        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                取引テンプレート
              </CardTitle>
              <CardDescription>
                よく使う取引をテンプレートとして保存しておくと、ワンタップで入力できます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateManager templates={templates} categories={categories} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- タブ: データ管理 --- */}
        <TabsContent value="data" className="space-y-6">
          {/* 店舗・サービス管理 */}
          <StoreManager stores={stores} />

          {/* データ入出力 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                データ入出力
              </CardTitle>
              <CardDescription>
                データのエクスポート・インポート
              </CardDescription>
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
              <CardDescription className="text-xs sm:text-sm">
                用途欄から店舗名を抽出して設定します。プレビューを確認してから適用してください。
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
