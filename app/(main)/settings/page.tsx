import type { Metadata } from "next";
import { getBudgets } from "@/app/actions/budget/get";
import { getTemplates } from "@/app/actions/template";

export const metadata: Metadata = {
  title: "設定",
  description:
    "アカウント管理、カテゴリ設定、予算管理、データ入出力、サブスクリプション管理。",
};

import { getCategories } from "@/app/actions/category/get";
import { getSubscription } from "@/app/actions/subscription/get";
import { SettingsView } from "@/components/features/settings/settings-view";
import { requireAuth } from "@/lib/auth/guard";

export default async function SettingsPage() {
  const [session, subscriptions, budgets, categories, templates] =
    await Promise.all([
      requireAuth(),
      getSubscription(),
      getBudgets(),
      getCategories(),
      getTemplates(),
    ]);

  return (
    <SettingsView
      session={session}
      subscriptions={subscriptions}
      budgets={budgets}
      categories={categories}
      templates={templates}
    />
  );
}
