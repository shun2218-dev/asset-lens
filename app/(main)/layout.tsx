import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/auth-guard";

type RequireAuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: RequireAuthLayoutProps) {
  await requireAuth();
  return <>{children}</>;
}
