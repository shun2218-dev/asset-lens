import { ProfileView } from "@/components/features/profile/profile-view";
import { requireAuth } from "@/lib/auth/guard";

export default async function ProfilePage() {
  const session = await requireAuth();

  return <ProfileView session={session} />;
}
