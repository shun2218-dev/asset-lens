import { getSubscription } from "@/app/actions/subscription/get";
import { SettingsView } from "@/components/features/settings/settings-view";
import { requireAuth } from "@/lib/auth/guard";

export default async function SettingsPage() {
  const [session, subscriptions] = await Promise.all([
    requireAuth(),
    getSubscription(), // サブスクリプション一覧を取得
  ]);

  return <SettingsView session={session} subscriptions={subscriptions} />;
}
