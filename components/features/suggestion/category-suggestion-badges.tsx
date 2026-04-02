"use client";

import { Sparkles } from "lucide-react";
import type { SelectCategory } from "@/db/schema";
import { cn } from "@/lib/utils";

interface CategorySuggestionBadgesProps {
  suggestions: Array<{ category: string; count: number }>;
  categories: SelectCategory[];
  currentValue: string;
  onSelect: (slug: string) => void;
}

export function CategorySuggestionBadges({
  suggestions,
  categories,
  currentValue,
  onSelect,
}: CategorySuggestionBadgesProps) {
  if (suggestions.length === 0) return null;

  const getCategoryName = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    return cat?.name ?? slug;
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
      <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
      {suggestions.map(({ category }) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
            "border border-border hover:bg-accent hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            category === currentValue &&
              "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground",
          )}
        >
          {getCategoryName(category)}
        </button>
      ))}
    </div>
  );
}
