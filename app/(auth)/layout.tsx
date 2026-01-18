import type { ReactNode } from "react";
import { requireGuest } from "@/lib/auth/guard";

type RequireGuestLayoutProps = {
  children: ReactNode;
};

export default async function RequireGuestLayout({
  children,
}: RequireGuestLayoutProps) {
  await requireGuest();
  return <>{children}</>;
}
