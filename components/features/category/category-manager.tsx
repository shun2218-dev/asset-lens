"use client";

import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCustomCategory } from "@/app/actions/category/create";
import { deleteCategory } from "@/app/actions/category/delete";
import { updateCategory } from "@/app/actions/category/update";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectCategory } from "@/db/schema";

interface CategoryManagerProps {
  categories: SelectCategory[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [editingCategory, setEditingCategory] = useState<SelectCategory | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] =
    useState<SelectCategory | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"expense" | "income">("expense");

  const systemCategories = categories.filter((c) => !c.userId);
  const userCategories = categories.filter((c) => c.userId);

  function openEditDialog(cat: SelectCategory) {
    setFormName(cat.name);
    setFormType(cat.type as "expense" | "income");
    setEditingCategory(cat);
  }

  function openCreateDialog() {
    setFormName("");
    setFormType("expense");
    setShowCreateDialog(true);
  }

  function handleCreate() {
    startTransition(async () => {
      const result = await createCustomCategory({
        name: formName,
        type: formType,
      });
      if (result.success) {
        toast.success("カテゴリを作成しました");
        setShowCreateDialog(false);
      } else {
        toast.error(result.error ?? "作成に失敗しました");
      }
    });
  }

  function handleUpdate() {
    if (!editingCategory) return;
    startTransition(async () => {
      const result = await updateCategory({
        id: editingCategory.id,
        name: formName,
        type: formType,
      });
      if (result.success) {
        toast.success("カテゴリを更新しました");
        setEditingCategory(null);
      } else {
        toast.error(result.error ?? "更新に失敗しました");
      }
    });
  }

  function handleDelete() {
    if (!deletingCategory) return;
    startTransition(async () => {
      const result = await deleteCategory(deletingCategory.id);
      if (result.success) {
        toast.success("カテゴリを削除しました");
        setDeletingCategory(null);
      } else {
        toast.error(result.error ?? "削除に失敗しました");
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                カテゴリ管理
              </CardTitle>
              <CardDescription>
                カスタムカテゴリの作成・編集・削除ができます
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={openCreateDialog}
              className="gap-1.5"
              id="create-category-button"
            >
              <Plus className="h-4 w-4" />
              新規作成
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User categories */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              カスタムカテゴリ
            </h4>
            {userCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                カスタムカテゴリはまだありません
              </p>
            ) : (
              <div className="space-y-2">
                {userCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <Badge
                        variant={
                          cat.type === "income" ? "default" : "secondary"
                        }
                      >
                        {cat.type === "income" ? "収入" : "支出"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(cat)}
                        aria-label={`${cat.name}を編集`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCategory(cat)}
                        className="text-destructive hover:text-destructive"
                        aria-label={`${cat.name}を削除`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System categories */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              システムカテゴリ
            </h4>
            <div className="space-y-2">
              {systemCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border border-dashed p-3 opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <Badge variant="outline">
                      {cat.type === "income" ? "収入" : "支出"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    編集不可
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>カテゴリを作成</DialogTitle>
            <DialogDescription>
              新しいカスタムカテゴリを作成します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="category-name">カテゴリ名</Label>
              <Input
                id="category-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例: 交際費"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-type">タイプ</Label>
              <Select
                value={formType}
                onValueChange={(v) => setFormType(v as "expense" | "income")}
              >
                <SelectTrigger id="category-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">支出</SelectItem>
                  <SelectItem value="income">収入</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isPending || !formName.trim()}
            >
              {isPending ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>カテゴリを編集</DialogTitle>
            <DialogDescription>
              カテゴリの名前やタイプを変更します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">カテゴリ名</Label>
              <Input
                id="edit-category-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例: 交際費"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-type">タイプ</Label>
              <Select
                value={formType}
                onValueChange={(v) => setFormType(v as "expense" | "income")}
              >
                <SelectTrigger id="edit-category-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">支出</SelectItem>
                  <SelectItem value="income">収入</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              キャンセル
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isPending || !formName.trim()}
            >
              {isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>カテゴリを削除</DialogTitle>
            <DialogDescription>
              「{deletingCategory?.name}」を削除しますか？
              この操作は取り消せません。紐づく取引がある場合は削除できません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
