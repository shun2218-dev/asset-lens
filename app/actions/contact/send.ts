"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { resend } from "@/lib/mail/client";
import { checkRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  category: z.enum(["question", "bug", "feature", "other"]),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
  recaptchaToken: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

const CATEGORY_LABELS: Record<string, string> = {
  question: "質問",
  bug: "バグ報告",
  feature: "機能要望",
  other: "その他",
};

/**
 * Sanitize user input to prevent XSS in email body.
 */
function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Verify reCAPTCHA v3 token with Google API.
 * Returns true if token is valid and score >= 0.5, or if no secret key is configured (dev mode).
 */
async function verifyRecaptcha(token?: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // Dev mode: skip verification

  if (!token) return false;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    });
    const data = await res.json();
    return data.success && (data.score ?? 0) >= 0.5;
  } catch {
    console.error("[Contact] reCAPTCHA verification failed");
    return false;
  }
}

export async function sendContactMessage(input: ContactInput) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const { allowed } = await checkRateLimit(ip, "contact");
  if (!allowed) {
    return {
      success: false,
      error: "Too many requests. Please try again later.",
    };
  }

  // Verify reCAPTCHA
  const isHuman = await verifyRecaptcha(parsed.data.recaptchaToken);
  if (!isHuman) {
    return { success: false, error: "Bot verification failed" };
  }

  const { name, email, category, message } = parsed.data;
  const notifyTo =
    process.env.CONTACT_NOTIFY_EMAIL ||
    process.env.EMAIL_FROM ||
    "onboarding@resend.dev";

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: notifyTo,
      replyTo: email,
      subject: `【AssetLens】お問い合わせ: ${CATEGORY_LABELS[category]}`,
      html: `
        <h2>お問い合わせ</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">名前</td><td style="padding:8px;border:1px solid #ddd">${sanitize(name)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">メール</td><td style="padding:8px;border:1px solid #ddd">${sanitize(email)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">カテゴリ</td><td style="padding:8px;border:1px solid #ddd">${CATEGORY_LABELS[category]}</td></tr>
        </table>
        <h3>内容</h3>
        <p style="white-space:pre-wrap">${sanitize(message)}</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("[Contact] Failed to send:", error);
    return { success: false, error: "Failed to send message" };
  }
}
