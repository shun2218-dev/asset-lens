"use client";

import { format } from "date-fns";
import { CalendarIcon, RotateCcw, Search } from "lucide-react";
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

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="内容で検索..."
          value={filters.searchQuery || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, searchQuery: e.target.value })
          }
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Category filter */}
        <Select
          value={filters.categoryId || "all"}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              categoryId: v === "all" ? undefined : v,
            })
          }
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by category">
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

        {/* Date from */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !filters.dateFrom && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, "MM/dd") : "開始日"}
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

        <span className="flex items-center text-muted-foreground">〜</span>

        {/* Date to */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !filters.dateTo && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
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
