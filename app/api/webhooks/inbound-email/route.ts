import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/db";
import * as schema from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Extract inquiry ID from a reply-to address like:
 *   reply+550e8400-e29b-41d4-a716-446655440000@asset-lens.com
 */
export function extractInquiryId(toAddress: string): string | null {
  const match = toAddress.match(
    /reply\+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );
  return match?.[1] ?? null;
}

/**
 * Verify the Resend webhook signature using svix headers.
 */
async function verifyWebhookSignature(
  payload: string,
  headers: {
    svixId: string | null;
    svixTimestamp: string | null;
    svixSignature: string | null;
  },
): Promise<boolean> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Inbound] RESEND_WEBHOOK_SECRET is not configured");
    return false;
  }

  if (!headers.svixId || !headers.svixTimestamp || !headers.svixSignature) {
    return false;
  }

  try {
    // Use Resend SDK's built-in verification
    resend.webhooks.verify({
      payload,
      headers: {
        id: headers.svixId,
        timestamp: headers.svixTimestamp,
        signature: headers.svixSignature,
      },
      webhookSecret: secret,
    });
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const payload = await request.text();

  // Verify webhook signature
  const isValid = await verifyWebhookSignature(payload, {
    svixId: request.headers.get("svix-id"),
    svixTimestamp: request.headers.get("svix-timestamp"),
    svixSignature: request.headers.get("svix-signature"),
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);

  // Only handle email.received events
  if (event.type !== "email.received") {
    return NextResponse.json({ received: true });
  }

  const { data } = event;

  // Extract inquiry ID from the "to" address
  const toAddresses: string[] = Array.isArray(data.to)
    ? data.to
    : [data.to].filter(Boolean);
  let inquiryId: string | null = null;
  for (const addr of toAddresses) {
    inquiryId = extractInquiryId(addr);
    if (inquiryId) break;
  }

  if (!inquiryId) {
    console.warn("[Inbound] Could not extract inquiry ID from:", toAddresses);
    return NextResponse.json({ received: true, skipped: true });
  }

  // Verify the inquiry exists
  const [inquiry] = await db
    .select({ id: schema.contactInquiry.id })
    .from(schema.contactInquiry)
    .where(eq(schema.contactInquiry.id, inquiryId))
    .limit(1);

  if (!inquiry) {
    console.warn("[Inbound] Inquiry not found:", inquiryId);
    return NextResponse.json({ received: true, skipped: true });
  }

  // Get email body — webhook may contain it directly or we need to fetch
  const emailBody =
    data.text || data.html?.replace(/<[^>]*>/g, "") || "(本文なし)";
  const emailSubject = data.subject || "(件名なし)";
  const senderEmail = data.from || "unknown@example.com";

  // Save inbound reply
  await db.insert(schema.inquiryReply).values({
    inquiryId,
    direction: "inbound",
    senderEmail,
    subject: emailSubject,
    body: emailBody.slice(0, 5000), // Limit body size
  });

  return NextResponse.json({ received: true, stored: true });
}
