"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getCategories } from "@/app/actions/category/get";
import { getStores } from "@/app/actions/store/get";
import { TransactionForm } from "@/components/features/transaction/transaction-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SelectCategory, SelectStore } from "@/db/schema";

export function QuickEntryDialog() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<SelectCategory[]>([]);
  const [stores, setStores] = useState<SelectStore[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open && !loaded) {
      Promise.all([getCategories(), getStores()]).then(([cats, sts]) => {
        setCategories(cats);
        setStores(sts);
        setLoaded(true);
      });
    }
  }, [open, loaded]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5" id="quick-entry-button">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">記録する</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>取引を記録</DialogTitle>
          <DialogDescription>
            収入・支出の取引情報を入力してください
          </DialogDescription>
        </DialogHeader>
        {loaded ? (
          <TransactionForm
            categories={categories}
            stores={stores}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
