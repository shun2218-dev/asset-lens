"use client";

import { Loader2, Receipt, SearchX } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { getTransaction } from "@/app/actions/transaction/get";
import { BulkActionBar } from "@/components/features/transaction/bulk-action-bar";
import { PaginationControl } from "@/components/features/transaction/pagination-control";
import { TransactionFilters } from "@/components/features/transaction/transaction-filters";
import { TransactionItem } from "@/components/features/transaction/transaction-item";
import { TransactionSortHeader } from "@/components/features/transaction/transaction-sort-header";
import { Checkbox } from "@/components/ui/checkbox";
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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isClientFetched = useRef(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Initialize search from URL
  const initialSearch = searchParams.get("q") || undefined;
  const [filters, setFilters] = useState<TransactionFilterParams>({
    searchQuery: initialSearch,
  });
  const [sort, setSort] = useState<TransactionSortParams>({});

  // Sync server data only when month changes (not during client-side filtering)
  useEffect(() => {
    if (!isClientFetched.current) {
      setTransactions(initialData);
      setMetadata(initialMetadata);
    }
    isClientFetched.current = false;
  }, [initialMetadata, initialData]);

  // Clear selection when transactions change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally clears selection on data change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [transactions]);

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

  // Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === transactions.length) {
        return new Set();
      }
      return new Set(transactions.map((t) => t.id));
    });
  }, [transactions]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // データを取得する共通関数
  const fetchData = useCallback(
    (
      page: number,
      currentFilters: TransactionFilterParams,
      currentSort: TransactionSortParams,
    ) => {
      startTransition(async () => {
        const result = await getTransaction({
          page,
          month: currentMonth,
          filters: currentFilters,
          sort: currentSort,
        });
        if (result.success) {
          isClientFetched.current = true;
          setTransactions(result.data.data);
          setMetadata(result.data.metadata);
        }
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
    fetchData(1, newFilters, sort);

    // Update URL without triggering server component re-render
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.searchQuery) {
      params.set("q", newFilters.searchQuery);
    } else {
      params.delete("q");
    }
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
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
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  };

  // After bulk action, refetch current page
  const handleBulkComplete = () => {
    clearSelection();
    fetchData(metadata.currentPage, filters, sort);
  };

  const isAllSelected =
    transactions.length > 0 && selectedIds.size === transactions.length;

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

      <BulkActionBar
        selectedIds={Array.from(selectedIds)}
        categories={categories}
        onComplete={handleBulkComplete}
        onClear={clearSelection}
      />

      {isPending && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="全て選択"
                id="select-all-checkbox"
              />
            </TableHead>
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
              isSelected={selectedIds.has(t.id)}
              onToggleSelect={toggleSelection}
              searchQuery={filters.searchQuery}
            />
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-40">
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="p-3 bg-muted/50 rounded-full">
                    {filters.searchQuery ? (
                      <SearchX className="h-6 w-6 text-muted-foreground/60" />
                    ) : (
                      <Receipt className="h-6 w-6 text-muted-foreground/60" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {filters.searchQuery
                      ? `「${filters.searchQuery}」に一致する取引が見つかりません`
                      : "まだ取引がありません。左のフォームから記録しましょう"}
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
