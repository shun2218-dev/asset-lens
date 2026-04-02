import { format } from "date-fns";
import type { Metadata } from "next";
import { Suspense } from "react";
import { TransactionSkeleton } from "@/components/layouts/page-skeletons";
import { TransactionContent } from "./transaction-content";

export const metadata: Metadata = {
  title: "取引一覧",
  description:
    "収入・支出の履歴を検索・フィルタ・ソート。取引データの一元管理と新規記録。",
};

interface TransactionsPage {
  searchParams: { month?: string; q?: string };
}

export default async function TransactionPage({
  searchParams,
}: TransactionsPage) {
  const params = await searchParams;
  const currentMonth = params.month || format(new Date(), "yyyy-MM");
  const searchQuery = params.q || undefined;

  return (
    <Suspense fallback={<TransactionSkeleton />}>
      <TransactionContent
        currentMonth={currentMonth}
        searchQuery={searchQuery}
      />
    </Suspense>
  );
}
