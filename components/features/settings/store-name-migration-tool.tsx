"use client";

import { format } from "date-fns";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Loader2,
  RotateCcw,
  Store,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import {
  applyStoreNameMigration,
  getTransactionsWithoutStore,
} from "@/app/actions/transaction/migrate-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TransactionRow = {
  id: string;
  description: string;
  storeName: string | null;
  date: Date;
  amount: number;
  category: string;
};

type EditableRow = TransactionRow & {
  proposedStoreName: string;
  proposedDescription: string;
  selected: boolean;
};

/**
 * 用途テキストから店舗名を推測分割
 * "ファミマ おにぎり" → { storeName: "ファミマ", description: "おにぎり" }
 */
function splitDescription(desc: string): {
  storeName: string;
  description: string;
} {
  const trimmed = desc.trim();
  // 半角スペースで最初の区切りを探す
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx > 0) {
    return {
      storeName: trimmed.substring(0, spaceIdx),
      description: trimmed.substring(spaceIdx + 1).trim(),
    };
  }
  // スペースがない場合は全体を店舗名として提案
  return { storeName: trimmed, description: "" };
}

export function StoreNameMigrationTool() {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // データ読み込み
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTransactionsWithoutStore();
      if (!result.success) {
        toast.error(result.error || "Failed to load data");
        return;
      }
      const editableRows: EditableRow[] = result.data.map((row) => {
        const split = splitDescription(row.description);
        return {
          ...row,
          proposedStoreName: split.storeName,
          proposedDescription: split.description,
          selected: true,
        };
      });
      setRows(editableRows);
    } catch (error) {
      console.error(error);
      toast.error("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 全選択/全解除
  const selectedCount = useMemo(
    () => rows.filter((r) => r.selected).length,
    [rows],
  );

  const toggleAll = useCallback(() => {
    const allSelected = rows.every((r) => r.selected);
    setRows((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  }, [rows]);

  // 行の選択切り替え
  const toggleRow = useCallback((id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    );
  }, []);

  // 提案値の編集
  const updateProposedStoreName = useCallback((id: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, proposedStoreName: value } : r)),
    );
  }, []);

  const updateProposedDescription = useCallback((id: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, proposedDescription: value } : r)),
    );
  }, []);

  // 適用
  const handleApply = () => {
    const selectedRows = rows.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      toast.error("更新する行を選択してください");
      return;
    }

    startTransition(async () => {
      const updates = selectedRows.map((r) => ({
        id: r.id,
        storeName: r.proposedStoreName,
        description: r.proposedDescription,
      }));

      const result = await applyStoreNameMigration(updates);

      if (result.success) {
        toast.success(`${result.data?.updatedCount ?? 0}件を更新しました`);
        // 更新されたデータをリストから除外
        setRows((prev) =>
          prev.filter((r) => !selectedRows.some((s) => s.id === r.id)),
        );
      } else {
        toast.error(result.error || "更新に失敗しました");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">
          データを読み込み中...
        </span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Store className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p>店舗名が未設定の取引データはありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー: 統計 + アクション */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length}件の対象データ（{selectedCount}件選択中）
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={toggleAll}>
            <CheckCheck className="mr-1 h-3 w-3" />
            {rows.every((r) => r.selected) ? "全解除" : "全選択"}
          </Button>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RotateCcw className="mr-1 h-3 w-3" />
            再読み込み
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isPending || selectedCount === 0}
          >
            {isPending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Check className="mr-1 h-3 w-3" />
            )}
            {selectedCount}件を適用
          </Button>
        </div>
      </div>

      {/* プレビューテーブル */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-24">日付</TableHead>
              <TableHead>現在の用途</TableHead>
              <TableHead className="w-8" />
              <TableHead>店舗名（提案）</TableHead>
              <TableHead>用途（提案）</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className={row.selected ? "" : "opacity-50"}
              >
                <TableCell>
                  <Checkbox
                    checked={row.selected}
                    onCheckedChange={() => toggleRow(row.id)}
                  />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(row.date, "MM/dd")}
                </TableCell>
                <TableCell className="text-sm font-mono max-w-[200px] truncate">
                  {row.description}
                </TableCell>
                <TableCell>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.proposedStoreName}
                    onChange={(e) =>
                      updateProposedStoreName(row.id, e.target.value)
                    }
                    className="h-8 text-sm"
                    placeholder="店舗名"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.proposedDescription}
                    onChange={(e) =>
                      updateProposedDescription(row.id, e.target.value)
                    }
                    className="h-8 text-sm"
                    placeholder="用途・メモ"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* フッター: 適用ボタン */}
      <div className="flex justify-end">
        <Button
          onClick={handleApply}
          disabled={isPending || selectedCount === 0}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          選択した{selectedCount}件を適用
        </Button>
      </div>
    </div>
  );
}
