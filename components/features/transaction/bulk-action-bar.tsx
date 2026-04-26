"use client";

import { Loader2, Tag, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  bulkDeleteTransactions,
  bulkUpdateCategory,
} from "@/app/actions/transaction/bulk-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectCategory } from "@/db/schema";

interface BulkActionBarProps {
  selectedIds: string[];
  categories: SelectCategory[];
  onComplete: () => void;
  onClear: () => void;
}

export function BulkActionBar({
  selectedIds,
  categories,
  onComplete,
  onClear,
}: BulkActionBarProps) {
  const [isPending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState<string>("");

  if (selectedIds.length === 0) return null;

  const handleBulkDelete = () => {
    startTransition(async () => {
      const result = await bulkDeleteTransactions({ ids: selectedIds });
      if (result.success) {
        toast.success(`${result.data.deletedCount}件の取引を削除しました`);
        onComplete();
      } else {
        toast.error("削除に失敗しました");
      }
    });
  };

  const handleBulkCategoryChange = () => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;

    startTransition(async () => {
      const result = await bulkUpdateCategory({
        ids: selectedIds,
        categoryId: cat.id,
      });
      if (result.success) {
        toast.success(
          `${result.data.updatedCount}件の取引を「${cat.name}」に変更しました`,
        );
        onComplete();
      } else {
        toast.error("カテゴリ変更に失敗しました");
      }
    });
  };

  return (
    <div
      className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 shadow-sm"
      id="bulk-action-bar"
    >
      <span className="text-sm font-medium">
        {selectedIds.length}件を選択中
      </span>

      <div className="flex items-center gap-2 ml-auto">
        {/* Category change */}
        <div className="flex items-center gap-1">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger
              className="w-[140px] h-8 text-xs"
              id="bulk-category-select"
            >
              <SelectValue placeholder="カテゴリ変更" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkCategoryChange}
            disabled={!categoryId || isPending}
            id="bulk-category-apply"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Tag className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              id="bulk-delete-button"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              削除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>一括削除の確認</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedIds.length}
                件の取引を削除します。この操作は取り消せません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                id="bulk-delete-confirm"
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Clear selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isPending}
          id="bulk-clear"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
