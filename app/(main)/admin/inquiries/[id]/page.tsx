import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInquiryById } from "@/app/actions/contact/get";
import { getRepliesByInquiryId } from "@/app/actions/contact/reply";
import { InquiryDetailView } from "@/components/features/admin/inquiry-detail-view";
import { requireAdmin } from "@/lib/auth/admin-guard";

export const metadata: Metadata = {
  title: "お問い合わせ詳細",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminInquiryDetailPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const [inquiry, replies] = await Promise.all([
    getInquiryById(id),
    getRepliesByInquiryId(id),
  ]);

  if (!inquiry) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <InquiryDetailView inquiry={inquiry} replies={replies} />
    </main>
  );
}
