"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteBudget } from "@/app/actions/budget/delete";
import { upsertBudget } from "@/app/actions/budget/upsert";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectBudget, SelectCategory } from "@/db/schema";

interface BudgetWithCategory extends SelectBudget {
  category: SelectCategory | null;
}

interface BudgetSettingsProps {
  budgets: BudgetWithCategory[];
  categories: SelectCategory[];
}

export function BudgetSettings({ budgets, categories }: BudgetSettingsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<string>("overall");
  const [newAmount, setNewAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const overallBudget = budgets.find((b) => !b.categoryId);
  const categoryBudgets = budgets.filter((b) => b.categoryId);

  // Categories that already have a budget set
  const usedCategoryIds = new Set(
    categoryBudgets.map((b) => b.categoryId).filter(Boolean),
  );
  const availableCategories = categories.filter(
    (c) => c.type === "expense" && !usedCategoryIds.has(c.id),
  );

  async function handleAdd() {
    if (!newAmount || Number(newAmount) <= 0) return;
    setIsSubmitting(true);
    await upsertBudget({
      categoryId: newCategoryId === "overall" ? null : newCategoryId,
      amount: Number(newAmount),
    });
    setNewAmount("");
    setNewCategoryId("overall");
    setIsSubmitting(false);
  }

  async function handleUpdate(id: string, categoryId: string | null) {
    if (!editAmount || Number(editAmount) <= 0) return;
    setIsSubmitting(true);
    await upsertBudget({
      categoryId,
      amount: Number(editAmount),
    });
    setEditingId(null);
    setEditAmount("");
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    setIsSubmitting(true);
    await deleteBudget(id);
    setIsSubmitting(false);
  }

  function startEditing(b: BudgetWithCategory) {
    setEditingId(b.id);
    setEditAmount(b.amount.toString());
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 予算設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Budget */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            全体の月間予算
          </h4>
          {overallBudget ? (
            <div className="flex items-center gap-2">
              {editingId === overallBudget.id ? (
                <>
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-32"
                    min={1}
                  />
                  <span className="text-sm text-muted-foreground">円</span>
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(overallBudget.id, null)}
                    disabled={isSubmitting}
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    キャンセル
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-lg font-bold">
                    ¥{overallBudget.amount.toLocaleString()}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEditing(overallBudget)}
                    aria-label="Edit budget"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        disabled={isSubmitting}
                        aria-label="Delete budget"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          予算を削除しますか？
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          全体の月間予算を削除します。この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(overallBudget.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">未設定</p>
          )}
        </div>

        {/* Category Budgets */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            カテゴリ別予算
          </h4>
          {categoryBudgets.length === 0 && (
            <p className="text-sm text-muted-foreground">
              カテゴリ別の予算はまだ設定されていません
            </p>
          )}
          {categoryBudgets.map((b) => (
            <div key={b.id} className="flex items-center gap-2">
              <span className="text-sm w-20 truncate">
                {b.category?.name ?? "不明"}
              </span>
              {editingId === b.id ? (
                <>
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-28"
                    min={1}
                  />
                  <span className="text-xs text-muted-foreground">円</span>
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(b.id, b.categoryId)}
                    disabled={isSubmitting}
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    ×
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">
                    ¥{b.amount.toLocaleString()}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => startEditing(b)}
                    aria-label="Edit category budget"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        disabled={isSubmitting}
                        aria-label="Delete category budget"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          予算を削除しますか？
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          「{b.category?.name ?? "不明"}
                          」の予算を削除します。この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(b.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add New Budget */}
        <div className="border-t pt-4 space-y-2">
          <h4 className="text-sm font-medium">予算を追加</h4>
          <div className="flex items-center gap-2">
            <Select value={newCategoryId} onValueChange={setNewCategoryId}>
              <SelectTrigger
                className="w-36"
                aria-label="Select budget category"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {!overallBudget && (
                  <SelectItem value="overall">全体予算</SelectItem>
                )}
                {availableCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="金額"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-28"
              min={1}
            />
            <span className="text-xs text-muted-foreground">円</span>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={isSubmitting || !newAmount}
            >
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
