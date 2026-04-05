"use client";

import { format } from "date-fns";
import { CalendarIcon, RotateCcw, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectCategory } from "@/db/schema";
import { cn } from "@/lib/utils";
import type { TransactionFilterParams } from "@/types";

interface TransactionFiltersProps {
  categories: SelectCategory[];
  filters: TransactionFilterParams;
  onFiltersChange: (filters: TransactionFilterParams) => void;
  onReset: () => void;
}

export function TransactionFilters({
  categories,
  filters,
  onFiltersChange,
  onReset,
}: TransactionFiltersProps) {
  const hasActiveFilters =
    !!filters.categoryId ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    !!filters.searchQuery;

  const [searchText, setSearchText] = useState(filters.searchQuery || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchText(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, searchQuery: value || undefined });
      }, 300);
    },
    [filters, onFiltersChange],
  );

  // Sync local state when filters are reset externally
  useEffect(() => {
    setSearchText(filters.searchQuery || "");
  }, [filters.searchQuery]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="内容・店舗名で検索..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters: SP = category full-width row + date row, PC = all in one row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category filter: full width on SP, fixed on PC */}
        <Select
          value={filters.categoryId || "all"}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              categoryId: v === "all" ? undefined : v,
            })
          }
        >
          <SelectTrigger
            className="w-full sm:w-[180px] h-11 md:h-9"
            aria-label="Filter by category"
          >
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのカテゴリ</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range: always stays on one line together */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal h-11 md:h-9",
                  !filters.dateFrom && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {filters.dateFrom
                  ? format(filters.dateFrom, "MM/dd")
                  : "開始日"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) =>
                  onFiltersChange({ ...filters, dateFrom: date ?? undefined })
                }
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground shrink-0">〜</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal h-11 md:h-9",
                  !filters.dateTo && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {filters.dateTo ? format(filters.dateTo, "MM/dd") : "終了日"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) =>
                  onFiltersChange({ ...filters, dateTo: date ?? undefined })
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1 h-3 w-3" />
            リセット
          </Button>
        )}
      </div>
    </div>
  );
}
