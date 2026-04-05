"use client";

import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SelectStore } from "@/db/schema";
import { cn } from "@/lib/utils";

interface StoreSelectProps {
  value?: string;
  onChange: (value: string) => void;
  stores: SelectStore[];
  onCreateStore?: (name: string) => Promise<void>;
}

export function StoreSelect({
  value,
  onChange,
  stores,
  onCreateStore,
}: StoreSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStores = useMemo(() => {
    if (!search) return stores;
    return stores.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [stores, search]);

  const selectedStore = useMemo(
    () => stores.find((s) => s.name === value),
    [stores, value],
  );

  const showCreateOption = useMemo(() => {
    if (!search.trim()) return false;
    return !stores.some(
      (s) => s.name.toLowerCase() === search.trim().toLowerCase(),
    );
  }, [stores, search]);

  const handleSelect = useCallback(
    (storeName: string) => {
      onChange(storeName);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const handleCreate = useCallback(async () => {
    const trimmedName = search.trim();
    if (!trimmedName) return;
    if (onCreateStore) {
      await onCreateStore(trimmedName);
    }
    onChange(trimmedName);
    setOpen(false);
    setSearch("");
  }, [search, onChange, onCreateStore]);

  const handleClear = useCallback(() => {
    onChange("");
    setOpen(false);
    setSearch("");
  }, [onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between font-normal h-11 md:h-9",
            !value && "text-muted-foreground",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <Store className="h-4 w-4 shrink-0" />
            {value || "店舗・サービス名を選択（任意）"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="p-2">
          <Input
            placeholder="検索または新規入力..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-48 overflow-y-auto">
          {value && (
            <button
              type="button"
              className="w-full px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent cursor-pointer"
              onClick={handleClear}
            >
              選択を解除
            </button>
          )}
          {filteredStores.map((s) => (
            <button
              type="button"
              key={s.id}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent cursor-pointer"
              onClick={() => handleSelect(s.name)}
            >
              <Check
                className={cn(
                  "h-4 w-4 shrink-0",
                  value === s.name ? "opacity-100" : "opacity-0",
                )}
              />
              {s.name}
            </button>
          ))}
          {filteredStores.length === 0 && !showCreateOption && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              候補がありません
            </p>
          )}
          {showCreateOption && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-accent cursor-pointer border-t"
              onClick={handleCreate}
            >
              <Plus className="h-4 w-4" />「{search.trim()}
              」を新規登録して選択
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
