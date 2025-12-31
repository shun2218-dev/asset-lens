// components/pagination-control.tsx
"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlProps {
  totalPages: number;
  currentPage: number;
}

export function PaginationControl({
  totalPages,
  currentPage,
}: PaginationControlProps) {
  // 1ページしかなければ表示しない
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        {/* 前へボタン */}
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? `/?page=${currentPage - 1}` : "#"}
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* ページ情報の表示 */}
        <div className="flex items-center gap-2 mx-4 text-sm font-medium text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>

        {/* 次へボタン */}
        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? `/?page=${currentPage + 1}` : "#"}
            aria-disabled={currentPage >= totalPages}
            className={
              currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
