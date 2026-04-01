import type { Metadata } from "next";
import { ProfileView } from "@/components/features/profile/profile-view";
import { requireAuth } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "プロフィール",
  description:
    "アカウント情報の確認と編集。表示名やメールアドレスを変更できます。",
};

export default async function ProfilePage() {
  const session = await requireAuth();

  return <ProfileView session={session} />;
}
