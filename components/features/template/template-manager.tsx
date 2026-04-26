"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from "@/app/actions/template";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SelectCategory, SelectTransactionTemplate } from "@/db/schema";

interface TemplateManagerProps {
  templates: SelectTransactionTemplate[];
  categories: SelectCategory[];
}

interface TemplateFormData {
  name: string;
  amount: number;
  description: string;
  storeName: string;
  categoryId: string;
  isExpense: boolean;
}

const emptyForm: TemplateFormData = {
  name: "",
  amount: 0,
  description: "",
  storeName: "",
  categoryId: "",
  isExpense: true,
};

export function TemplateManager({
  templates: initialTemplates,
  categories,
}: TemplateManagerProps) {
  const [templates, setTemplates] =
    useState<SelectTransactionTemplate[]>(initialTemplates);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(emptyForm);
  const [isPending, startTransition] = useTransition();

  const handleOpen = useCallback((template?: SelectTransactionTemplate) => {
    if (template) {
      setEditingId(template.id);
      setFormData({
        name: template.name,
        amount: template.amount,
        description: template.description ?? "",
        storeName: template.storeName ?? "",
        categoryId: template.categoryId,
        isExpense: template.isExpense,
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    startTransition(async () => {
      if (editingId) {
        const result = await updateTemplate({
          id: editingId,
          ...formData,
          storeName: formData.storeName || undefined,
        });
        if (result.success) {
          setTemplates((prev) =>
            prev.map((t) =>
              t.id === editingId
                ? {
                    ...t,
                    ...formData,
                    storeName: formData.storeName || null,
                  }
                : t,
            ),
          );
          toast.success("テンプレートを更新しました");
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createTemplate({
          ...formData,
          storeName: formData.storeName || undefined,
        });
        if (result.success) {
          setTemplates((prev) => [
            ...prev,
            {
              id: result.data.id,
              userId: "",
              ...formData,
              storeName: formData.storeName || null,
              usageCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
          toast.success("テンプレートを作成しました");
        } else {
          toast.error(result.error);
        }
      }
      setOpen(false);
    });
  }, [editingId, formData]);

  const handleDelete = useCallback((id: string) => {
    startTransition(async () => {
      const result = await deleteTemplate(id);
      if (result.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success("テンプレートを削除しました");
      } else {
        toast.error(result.error);
      }
    });
  }, []);

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");
  const filteredCategories = formData.isExpense
    ? expenseCategories
    : incomeCategories;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          テンプレート ({templates.length}/20)
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={() => handleOpen()}
              disabled={templates.length >= 20}
            >
              <Plus className="mr-1 h-4 w-4" />
              追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "テンプレート編集" : "テンプレート作成"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>テンプレート名</Label>
                <Input
                  placeholder="家賃、電気代など"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <Tabs
                value={formData.isExpense ? "expense" : "income"}
                onValueChange={(v) =>
                  setFormData((p) => ({
                    ...p,
                    isExpense: v === "expense",
                    categoryId: "",
                  }))
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="expense"
                    className="data-[state=active]:bg-red-700 data-[state=active]:text-white"
                  >
                    支出
                  </TabsTrigger>
                  <TabsTrigger
                    value="income"
                    className="data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                  >
                    収入
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>金額</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        amount: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>カテゴリ</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, categoryId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>店舗名（任意）</Label>
                <Input
                  placeholder="コンビニ、スーパーなど"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      storeName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>用途・メモ（任意）</Label>
                <Input
                  placeholder="毎月の固定費"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isPending || !formData.name || !formData.amount}
              >
                {editingId ? "更新" : "作成"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          テンプレートがありません。よく使う取引を登録しましょう。
        </p>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{template.name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${template.isExpense ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"}`}
                  >
                    {template.isExpense ? "支出" : "収入"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ¥{template.amount.toLocaleString()} ·{" "}
                  {categories.find((c) => c.id === template.categoryId)?.name ??
                    "Unknown"}
                  {template.usageCount > 0 && (
                    <span className="ml-2">({template.usageCount}回使用)</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleOpen(template)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(template.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
