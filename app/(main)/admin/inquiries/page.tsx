import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getInquiries } from "@/app/actions/contact/get";
import { InquiryListView } from "@/components/features/admin/inquiry-list-view";
import { Separator } from "@/components/ui/separator";
import { requireAdmin } from "@/lib/auth/admin-guard";

export const metadata: Metadata = {
  title: "お問い合わせ管理",
};

type PageProps = {
  searchParams: Promise<{
    status?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const { items, totalCount, totalPages, currentPage } = await getInquiries({
    status: params.status,
    category: params.category,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="space-y-1 mb-6">
        <div className="flex items-center gap-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl sm:text-3xl font-bold">お問い合わせ管理</h1>
        </div>
        <p className="text-muted-foreground">
          ユーザーからのお問い合わせを管理します
        </p>
      </div>

      <Separator className="mb-6" />

      <Suspense
        fallback={<div className="text-muted-foreground">読込中...</div>}
      >
        <InquiryListView
          items={items}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          currentStatus={params.status}
          currentCategory={params.category}
        />
      </Suspense>
    </main>
  );
}
