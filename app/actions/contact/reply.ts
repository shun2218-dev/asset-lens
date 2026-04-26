"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { resend } from "@/lib/mail/client";
import { getInquiryReplyTemplate } from "@/lib/mail/templates/inquiry-reply";

const replySchema = z.object({
  inquiryId: z.string().uuid(),
  subject: z.string().min(1, "件名は必須です").max(200),
  body: z.string().min(1, "本文は必須です").max(5000),
});

export type ReplyInput = z.infer<typeof replySchema>;

export async function replyToInquiry(input: ReplyInput) {
  const session = await requireAdmin();

  const parsed = replySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { inquiryId, subject, body } = parsed.data;

  // Fetch the original inquiry
  const [inquiry] = await db
    .select()
    .from(schema.contactInquiry)
    .where(eq(schema.contactInquiry.id, inquiryId))
    .limit(1);

  if (!inquiry) {
    return { success: false as const, error: "お問い合わせが見つかりません" };
  }

  const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";

  try {
    // Send reply email via Resend
    await resend.emails.send({
      from: emailFrom,
      to: inquiry.email,
      replyTo: session.user.email,
      subject: `【AssetLens】${subject}`,
      html: getInquiryReplyTemplate({
        recipientName: inquiry.name,
        originalMessage: inquiry.message,
        originalCategory: inquiry.category,
        replyBody: body,
      }),
    });

    // Save reply record
    await db.insert(schema.inquiryReply).values({
      inquiryId,
      adminEmail: session.user.email,
      subject,
      body,
    });

    // Auto-update status to in_progress if still new
    if (inquiry.status === "new") {
      await db
        .update(schema.contactInquiry)
        .set({ status: "in_progress" })
        .where(eq(schema.contactInquiry.id, inquiryId));
    }

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${inquiryId}`);

    return { success: true as const };
  } catch (error) {
    console.error("[Reply] Failed to send reply:", error);
    return {
      success: false as const,
      error: "返信メールの送信に失敗しました",
    };
  }
}

export async function getRepliesByInquiryId(inquiryId: string) {
  await requireAdmin();

  return db
    .select()
    .from(schema.inquiryReply)
    .where(eq(schema.inquiryReply.inquiryId, inquiryId))
    .orderBy(desc(schema.inquiryReply.createdAt));
}
