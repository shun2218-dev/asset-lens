"use client";

import dynamic from "next/dynamic";
import { TransactionForm } from "@/components/features/transaction/transaction-form";
import { TransactionList } from "@/components/features/transaction/transaction-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Lazy-loaded — only rendered when bulk tab is selected */
const BulkTransactionForm = dynamic(
  () =>
    import("@/components/features/transaction/bulk-transaction-form").then(
      (mod) => mod.BulkTransactionForm,
    ),
  { loading: () => <Skeleton className="h-[400px] w-full rounded-lg" /> },
);

import type {
  SelectCategory,
  SelectStore,
  SelectTransaction,
} from "@/db/schema";
import type { TransactionMetadata } from "@/types";

interface TransactionPageViewProps {
  transactions: SelectTransaction[];
  metadata: TransactionMetadata;
  currentMonth: string;
  categories: SelectCategory[];
  stores: SelectStore[];
}

export function TransactionPageView({
  transactions,
  metadata,
  currentMonth,
  categories,
  stores,
}: TransactionPageViewProps) {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10 pb-24 md:pb-10 space-y-8 min-h-screen">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">取引管理</h1>
        <p className="text-muted-foreground mt-2">
          収支の記録と履歴の確認・管理
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左側: 入力フォーム (1カラム) */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>新規入力</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="single">通常入力</TabsTrigger>
                  <TabsTrigger value="bulk">一括入力</TabsTrigger>
                </TabsList>
                <TabsContent value="single">
                  <TransactionForm categories={categories} stores={stores} />
                </TabsContent>
                <TabsContent value="bulk">
                  <BulkTransactionForm
                    categories={categories}
                    stores={stores}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* 右側: 取引一覧 (2カラム) */}
        <div className="md:col-span-2">
          <TransactionList
            initialData={transactions}
            initialMetadata={metadata}
            currentMonth={currentMonth}
            categories={categories}
            stores={stores}
            showFilters
          />
        </div>
      </div>
    </main>
  );
}
