"use client";

import { Loader2, Receipt } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { getTransaction } from "@/app/actions/transaction/get";
import { PaginationControl } from "@/components/features/transaction/pagination-control";
import { TransactionFilters } from "@/components/features/transaction/transaction-filters";
import { TransactionItem } from "@/components/features/transaction/transaction-item";
import { TransactionSortHeader } from "@/components/features/transaction/transaction-sort-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  SelectCategory,
  SelectStore,
  SelectTransaction,
} from "@/db/schema";
import type { TransactionFilterParams, TransactionSortParams } from "@/types";

interface TransactionListProps {
  initialData: SelectTransaction[];
  initialMetadata: {
    totalPages: number;
    totalCount: number;
    currentPage: number;
  };
  currentMonth: string;
  categories: SelectCategory[];
  stores: SelectStore[];
  showFilters?: boolean;
}

export type OptimisticDeleteFn = (id: string) => { restore: () => void };

export function TransactionList({
  initialData,
  initialMetadata,
  currentMonth,
  categories,
  stores,
  showFilters = false,
}: TransactionListProps) {
  // 状態管理
  const [transactions, setTransactions] = useState(initialData);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<TransactionFilterParams>({});
  const [sort, setSort] = useState<TransactionSortParams>({});

  // 月が変わったらデータを初期化（リセット）
  useEffect(() => {
    setTransactions(initialData);
    setMetadata(initialMetadata);
  }, [initialMetadata, initialData]);

  const optimisticDelete: OptimisticDeleteFn = useCallback(
    (id: string) => {
      const prev = transactions;
      setTransactions((t) => t.filter((item) => item.id !== id));
      return {
        restore: () => setTransactions(prev),
      };
    },
    [transactions],
  );

  // データを取得する共通関数
  const fetchData = useCallback(
    (
      page: number,
      currentFilters: TransactionFilterParams,
      currentSort: TransactionSortParams,
    ) => {
      startTransition(async () => {
        const { data, metadata: newMeta } = await getTransaction(
          page,
          currentMonth,
          currentFilters,
          currentSort,
        );
        setTransactions(data);
        setMetadata(newMeta);
      });
    },
    [currentMonth],
  );

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    fetchData(page, filters, sort);
  };

  // フィルタ変更時
  const handleFiltersChange = (newFilters: TransactionFilterParams) => {
    setFilters(newFilters);
    fetchData(1, newFilters, sort); // Reset to page 1
  };

  // ソート変更時
  const handleSortChange = (newSort: TransactionSortParams) => {
    setSort(newSort);
    fetchData(1, filters, newSort); // Reset to page 1
  };

  // リセット
  const handleReset = () => {
    setFilters({});
    setSort({});
    fetchData(1, {}, {});
  };

  return (
    <div className="relative space-y-4">
      {showFilters && (
        <TransactionFilters
          categories={categories}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />
      )}

      {isPending && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TransactionSortHeader
              label="日付"
              field="date"
              currentSort={sort}
              onSort={handleSortChange}
            />
            <TableHead>内容</TableHead>
            <TableHead>店舗</TableHead>
            <TransactionSortHeader
              label="カテゴリ"
              field="category"
              currentSort={sort}
              onSort={handleSortChange}
            />
            <TransactionSortHeader
              label="金額"
              field="amount"
              currentSort={sort}
              onSort={handleSortChange}
              className="text-right"
            />
            <TableHead className="w-12.5">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TransactionItem
              data={t}
              key={t.id}
              categories={categories}
              stores={stores}
              onOptimisticDelete={optimisticDelete}
            />
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-40">
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="p-3 bg-muted/50 rounded-full">
                    <Receipt className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    まだ取引がありません。左のフォームから記録しましょう
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <PaginationControl
        totalPages={metadata.totalPages}
        currentPage={metadata.currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
