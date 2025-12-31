// components/pagination-control.tsx
"use client";

import { useSearchParams } from "next/navigation";
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
  onPageChange?: (page: number) => void;
}

export function PaginationControl({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationControlProps) {
  const searchParams = useSearchParams();

  // 1ページしかなければ表示しない
  if (totalPages <= 1) return null;

  //   const createPageURL = (pageNumber: number) => {
  //     const params = new URLSearchParams(searchParams.toString());
  //     params.set("page", pageNumber.toString());
  //     return `/?${params.toString()}`;
  //   };

  const handlePageChange = (e: React.MouseEvent, page: number) => {
    e.preventDefault(); // リンク遷移を無効化
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        {/* 前へボタン */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => handlePageChange(e, currentPage - 1)}
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
            href="#"
            onClick={(e) => handlePageChange(e, currentPage + 1)}
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
