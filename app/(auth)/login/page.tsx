import { PasskeyAuth } from "@/components/features/auth/passkey-auth";

import { requireGuest } from "@/lib/auth/guard";

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
