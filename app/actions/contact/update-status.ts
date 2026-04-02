"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireAdmin } from "@/lib/auth/admin-guard";

const VALID_STATUSES = ["new", "in_progress", "resolved", "closed"] as const;

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(VALID_STATUSES),
  note: z.string().max(2000).optional(),
});

export type UpdateStatusInput = z.infer<typeof updateSchema>;

export async function updateInquiryStatus(input: UpdateStatusInput) {
  await requireAdmin();

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, status, note } = parsed.data;

  const [existing] = await db
    .select({ id: schema.contactInquiry.id })
    .from(schema.contactInquiry)
    .where(eq(schema.contactInquiry.id, id))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Inquiry not found" };
  }

  await db
    .update(schema.contactInquiry)
    .set({
      status,
      ...(note !== undefined ? { note } : {}),
    })
    .where(eq(schema.contactInquiry.id, id));

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);

  return { success: true };
}
