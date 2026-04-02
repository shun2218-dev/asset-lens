"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  return session;
}

export async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}
