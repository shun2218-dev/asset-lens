"use client";

import { Zap } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { incrementTemplateUsage } from "@/app/actions/template";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SelectTransactionTemplate } from "@/db/schema";

interface TemplateQuickAddProps {
  templates: SelectTransactionTemplate[];
  onSelect: (template: SelectTransactionTemplate) => void;
}

export function TemplateQuickAdd({
  templates,
  onSelect,
}: TemplateQuickAddProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelect = useCallback(
    (template: SelectTransactionTemplate) => {
      onSelect(template);
      setOpen(false);
      startTransition(async () => {
        await incrementTemplateUsage(template.id);
      });
    },
    [onSelect],
  );

  if (templates.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          テンプレート
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t)}
              disabled={isPending}
              className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-muted-foreground">
                ¥{t.amount.toLocaleString()} · {t.isExpense ? "支出" : "収入"}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
