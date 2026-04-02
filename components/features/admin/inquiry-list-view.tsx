"use client";

import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Inbox, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  CATEGORY_LABELS,
  InquiryStatusBadge,
  STATUS_OPTIONS,
} from "@/components/features/admin/inquiry-status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SelectContactInquiry } from "@/db/schema";

interface InquiryListViewProps {
  items: SelectContactInquiry[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentStatus?: string;
  currentCategory?: string;
}

export function InquiryListView({
  items,
  totalCount,
  totalPages,
  currentPage,
  currentStatus,
  currentCategory,
}: InquiryListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/admin/inquiries?${params.toString()}`);
    },
    [router, searchParams],
  );

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page > 1) {
        params.set("page", String(page));
      } else {
        params.delete("page");
      }
      router.push(`/admin/inquiries?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={currentStatus ?? "all"}
          onValueChange={(v) => updateFilter("status", v)}
        >
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentCategory ?? "all"}
          onValueChange={(v) => updateFilter("category", v)}
        >
          <SelectTrigger className="w-36" aria-label="Filter by category">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          {totalCount}件
        </span>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          {currentStatus || currentCategory ? (
            <>
              <Search className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">条件に一致するお問い合わせがありません</p>
            </>
          ) : (
            <>
              <Inbox className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">お問い合わせはまだありません</p>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ステータス</TableHead>
                <TableHead className="w-24">カテゴリ</TableHead>
                <TableHead>名前</TableHead>
                <TableHead className="hidden sm:table-cell">メール</TableHead>
                <TableHead className="hidden md:table-cell">
                  メッセージ
                </TableHead>
                <TableHead className="w-28">日時</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((inquiry) => (
                <TableRow key={inquiry.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/admin/inquiries/${inquiry.id}`}>
                      <InquiryStatusBadge status={inquiry.status} />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="text-sm"
                    >
                      {CATEGORY_LABELS[inquiry.category] ?? inquiry.category}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="font-medium"
                    >
                      {inquiry.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="text-sm text-muted-foreground"
                    >
                      {inquiry.email}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs">
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="text-sm text-muted-foreground truncate block"
                    >
                      {inquiry.message.slice(0, 60)}
                      {inquiry.message.length > 60 ? "…" : ""}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="text-xs text-muted-foreground whitespace-nowrap"
                    >
                      {formatDistanceToNow(new Date(inquiry.createdAt), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            前へ
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
