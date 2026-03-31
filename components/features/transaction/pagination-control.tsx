"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="pagination"
      className="mx-auto flex w-full justify-center mt-8"
    >
      <div className="flex flex-row items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:block">Previous</span>
        </Button>

        <span className="flex items-center gap-2 mx-4 text-sm font-medium text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className="gap-1"
        >
          <span className="hidden sm:block">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
