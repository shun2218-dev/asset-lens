import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/guard";

type RequireAuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: RequireAuthLayoutProps) {
  await requireAuth();
  return <>{children}</>;
}
