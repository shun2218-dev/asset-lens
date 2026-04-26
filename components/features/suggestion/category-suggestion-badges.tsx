"use client";

import { Sparkles } from "lucide-react";
import type { SelectCategory } from "@/db/schema";
import { cn } from "@/lib/utils";

interface CategorySuggestionBadgesProps {
  suggestions: Array<{ categoryId: string; slug: string; count: number }>;
  categories: SelectCategory[];
  currentValue: string;
  onSelect: (categoryId: string) => void;
}

export function CategorySuggestionBadges({
  suggestions,
  categories,
  currentValue,
  onSelect,
}: CategorySuggestionBadgesProps) {
  if (suggestions.length === 0) return null;

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name ?? categoryId;
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
      <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
      {suggestions.map(({ categoryId }) => (
        <button
          key={categoryId}
          type="button"
          onClick={() => onSelect(categoryId)}
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
            "border border-border hover:bg-accent hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            categoryId === currentValue &&
              "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground",
          )}
        >
          {getCategoryName(categoryId)}
        </button>
      ))}
    </div>
  );
}
