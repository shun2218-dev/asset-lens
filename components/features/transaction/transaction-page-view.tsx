"use client";

import { TransactionList } from "@/components/features/transaction/transaction-list";
import type { SelectCategory, SelectTransaction } from "@/db/schema";
import type { TransactionMetadata } from "@/types";

interface TransactionPageViewProps {
  transactions: SelectTransaction[];
  metadata: TransactionMetadata;
  currentMonth: string;
  categories: SelectCategory[];
}

export function TransactionPageView({
  transactions,
  metadata,
  currentMonth,
  categories,
}: TransactionPageViewProps) {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold">取引一覧</h1>
        <p className="text-muted-foreground mt-2">
          日々の収支履歴を確認・管理します
        </p>
      </div>

      <TransactionList
        initialData={transactions}
        initialMetadata={metadata}
        currentMonth={currentMonth}
        categories={categories}
      />
    </main>
  );
}
