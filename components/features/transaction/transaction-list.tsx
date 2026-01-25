"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { getTransaction } from "@/app/actions/transaction/get";
import { PaginationControl } from "@/components/features/transaction/pagination-control";
import { TransactionItem } from "@/components/features/transaction/transaction-item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SelectCategory, SelectTransaction } from "@/db/schema";

interface TransactionListProps {
  initialData: SelectTransaction[];
  initialMetadata: {
    totalPages: number;
    totalCount: number;
    currentPage: number;
  };
  currentMonth: string;
  categories: SelectCategory[];
}

export function TransactionList({
  initialData,
  initialMetadata,
  currentMonth,
  categories,
}: TransactionListProps) {
  // 状態管理
  const [transactions, setTransactions] = useState(initialData);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [isPending, startTransition] = useTransition();

  // 月が変わったらデータを初期化（リセット）
  useEffect(() => {
    setTransactions(initialData);
    setMetadata(initialMetadata);
  }, [initialMetadata, initialData]);

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    // トランジション（読み込み中状態の管理）を開始
    startTransition(async () => {
      // サーバーアクションを直接呼び出し
      const { data, metadata: newMeta } = await getTransaction(
        page,
        currentMonth,
      );
      setTransactions(data);
      setMetadata(newMeta);
    });
  };

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日付</TableHead>
            <TableHead>内容</TableHead>
            <TableHead>カテゴリ</TableHead>
            <TableHead className="text-right">金額</TableHead>
            <TableHead className="w-12.5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TransactionItem data={t} key={t.id} categories={categories} />
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground h-24"
              >
                データがありません
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
