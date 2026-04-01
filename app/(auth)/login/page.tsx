import type { Metadata } from "next";
import { PasskeyAuth } from "@/components/features/auth/passkey-auth";

import { requireGuest } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "ログイン",
  description:
    "AssetLensにログイン。パスキー認証またはメールアドレスでアクセスできます。",
};

export default async function LoginPage() {
  await requireGuest();

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <PasskeyAuth />
      </div>
    </main>
  );
}
