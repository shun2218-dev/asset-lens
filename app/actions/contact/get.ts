"use server";

import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireAdmin } from "@/lib/auth/admin-guard";

const ITEMS_PER_PAGE = 20;

export type InquiryFilters = {
  status?: string;
  category?: string;
  page?: number;
};

export async function getInquiries(filters: InquiryFilters = {}) {
  await requireAdmin();

  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const conditions: SQL[] = [];
  if (filters.status) {
    conditions.push(eq(schema.contactInquiry.status, filters.status));
  }
  if (filters.category) {
    conditions.push(eq(schema.contactInquiry.category, filters.category));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [total]] = await Promise.all([
    db
      .select()
      .from(schema.contactInquiry)
      .where(where)
      .orderBy(desc(schema.contactInquiry.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset(offset),
    db.select({ count: count() }).from(schema.contactInquiry).where(where),
  ]);

  return {
    items,
    totalCount: total?.count ?? 0,
    totalPages: Math.ceil((total?.count ?? 0) / ITEMS_PER_PAGE),
    currentPage: page,
  };
}

export async function getInquiryById(id: string) {
  await requireAdmin();

  const [inquiry] = await db
    .select()
    .from(schema.contactInquiry)
    .where(eq(schema.contactInquiry.id, id))
    .limit(1);

  return inquiry ?? null;
}
