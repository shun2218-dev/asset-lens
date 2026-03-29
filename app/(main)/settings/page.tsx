import { getBudgets } from "@/app/actions/budget/get";
import { getCategories } from "@/app/actions/category/get";
import { getSubscription } from "@/app/actions/subscription/get";
import { SettingsView } from "@/components/features/settings/settings-view";
import { requireAuth } from "@/lib/auth/guard";

export default async function SettingsPage() {
  const [session, subscriptions, budgets, categories] = await Promise.all([
    requireAuth(),
    getSubscription(),
    getBudgets(),
    getCategories(),
  ]);

  return (
    <SettingsView
      session={session}
      subscriptions={subscriptions}
      budgets={budgets}
      categories={categories}
    />
  );
}
