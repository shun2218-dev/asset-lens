"use client";

import { Pencil, Plus, Store, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createStore } from "@/app/actions/store/create";
import { deleteStore } from "@/app/actions/store/delete";
import { updateStore } from "@/app/actions/store/update";
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
import type { SelectStore } from "@/db/schema";

interface StoreManagerProps {
  stores: SelectStore[];
}

export function StoreManager({ stores }: StoreManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [editingStore, setEditingStore] = useState<SelectStore | null>(null);
  const [deletingStore, setDeletingStore] = useState<SelectStore | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formName, setFormName] = useState("");

  function openEditDialog(s: SelectStore) {
    setFormName(s.name);
    setEditingStore(s);
  }

  function openCreateDialog() {
    setFormName("");
    setShowCreateDialog(true);
  }

  function handleCreate() {
    startTransition(async () => {
      const result = await createStore(formName);
      if (result.success) {
        toast.success("店舗を登録しました");
        setShowCreateDialog(false);
      } else {
        toast.error(result.error ?? "登録に失敗しました");
      }
    });
  }

  function handleUpdate() {
    if (!editingStore) return;
    startTransition(async () => {
      const result = await updateStore({
        id: editingStore.id,
        name: formName,
      });
      if (result.success) {
        toast.success("店舗名を更新しました");
        setEditingStore(null);
      } else {
        toast.error(result.error ?? "更新に失敗しました");
      }
    });
  }

  function handleDelete() {
    if (!deletingStore) return;
    startTransition(async () => {
      const result = await deleteStore(deletingStore.id);
      if (result.success) {
        toast.success("店舗を削除しました");
        setDeletingStore(null);
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
                <Store className="h-5 w-5" />
                店舗・サービス管理
              </CardTitle>
              <CardDescription>
                登録済みの店舗名の編集・削除ができます
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={openCreateDialog}
              className="gap-1.5"
              id="create-store-button"
            >
              <Plus className="h-4 w-4" />
              新規追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Store className="h-10 w-10 mb-2 opacity-20" />
              <p>登録された店舗はありません</p>
              <p className="text-xs mt-1">
                取引入力時に新しい店舗名を入力すると自動で登録されます
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {stores.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium truncate">{s.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(s)}
                      aria-label={`${s.name}を編集`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingStore(s)}
                      className="text-destructive hover:text-destructive"
                      aria-label={`${s.name}を削除`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>店舗を追加</DialogTitle>
            <DialogDescription>
              新しい店舗・サービス名を登録します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="store-name">店舗名</Label>
              <Input
                id="store-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例: スーパーマーケット"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formName.trim()) handleCreate();
                }}
              />
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
              {isPending ? "登録中..." : "登録"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingStore}
        onOpenChange={(open) => !open && setEditingStore(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>店舗名を編集</DialogTitle>
            <DialogDescription>
              店舗・サービスの名前を変更します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-store-name">店舗名</Label>
              <Input
                id="edit-store-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例: スーパーマーケット"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formName.trim()) handleUpdate();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStore(null)}>
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
        open={!!deletingStore}
        onOpenChange={(open) => !open && setDeletingStore(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>店舗を削除</DialogTitle>
            <DialogDescription>
              「{deletingStore?.name}
              」を削除しますか？取引で使用中の店舗は削除できません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingStore(null)}>
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
