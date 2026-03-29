"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  TransactionSortField,
  TransactionSortOrder,
  TransactionSortParams,
} from "@/types";

interface TransactionSortHeaderProps {
  label: string;
  field: TransactionSortField;
  currentSort: TransactionSortParams;
  onSort: (sort: TransactionSortParams) => void;
  className?: string;
}

export function TransactionSortHeader({
  label,
  field,
  currentSort,
  onSort,
  className,
}: TransactionSortHeaderProps) {
  const isActive = currentSort.sortBy === field;
  const currentOrder = isActive ? currentSort.sortOrder : undefined;

  const handleClick = () => {
    if (!isActive) {
      // First click: sort ascending
      onSort({ sortBy: field, sortOrder: "asc" });
    } else if (currentOrder === "asc") {
      // Second click: sort descending
      onSort({ sortBy: field, sortOrder: "desc" });
    } else {
      // Third click: remove sort
      onSort({});
    }
  };

  return (
    <TableHead
      className={cn("cursor-pointer select-none hover:bg-muted/50", className)}
      onClick={handleClick}
    >
      <span className="flex items-center gap-1">
        {label}
        {!isActive && <ArrowUpDown className="h-3 w-3 text-muted-foreground" />}
        {isActive && currentOrder === "asc" && <ArrowUp className="h-3 w-3" />}
        {isActive && currentOrder === "desc" && (
          <ArrowDown className="h-3 w-3" />
        )}
      </span>
    </TableHead>
  );
}
