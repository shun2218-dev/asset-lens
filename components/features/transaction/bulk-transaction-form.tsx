"use client";

import { format } from "date-fns";
import { CalendarIcon, Camera, Loader2, Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { scanReceiptBulk } from "@/app/actions/analysis/scan-receipt";
import { createStore } from "@/app/actions/store/create";
import { CategorySelect } from "@/components/features/category/category-select";
import { StoreSelect } from "@/components/features/store/store-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SelectCategory, SelectStore } from "@/db/schema";
import { useBulkTransactionForm } from "@/hooks/use-bulk-transaction-form";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

interface BulkTransactionFormProps {
  categories: SelectCategory[];
  stores: SelectStore[];
}

export function BulkTransactionForm({
  categories,
  stores: initialStores,
}: BulkTransactionFormProps) {
  const { data: session } = useSession();

  const {
    form,
    fields,
    addEntry,
    removeEntry,
    setEntriesFromScan,
    onSubmit,
    isSubmitting,
  } = useBulkTransactionForm();

  const [mounted, setMounted] = useState(false);
  const [stores, setStores] = useState(initialStores);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // カテゴリslugからIDを解決
  const resolveCategoryId = useCallback(
    (slug: string): string | undefined => {
      const cat = categories.find((c) => c.slug === slug);
      return cat?.id;
    },
    [categories],
  );

  // レシートスキャン処理
  const handleReceiptScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("ファイルサイズが大きすぎます (上限4MB)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsScanning(true);
      toast.loading("レシートを解析中...", { id: "bulk-scan" });

      const formData = new FormData();
      formData.append("file", file);

      const result = await scanReceiptBulk(formData);

      // 店舗名を自動登録
      if (result.storeName) {
        const existing = stores.find((s) => s.name === result.storeName);
        if (!existing && session) {
          await handleCreateStore(result.storeName);
        }
      }

      // フォームに反映
      setEntriesFromScan(result, resolveCategoryId);

      const itemCount = result.items.length;
      toast.success(`解析完了: ${itemCount}件の商品を検出しました`, {
        id: "bulk-scan",
      });
    } catch (error) {
      console.error(error);
      toast.error("レシートの読み取りに失敗しました", { id: "bulk-scan" });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) return null;

  const handleCreateStore = async (name: string) => {
    const result = await createStore(name);
    if (result.success && result.id) {
      setStores((prev) => {
        if (prev.some((s) => s.name === name)) return prev;
        return [
          ...prev,
          {
            id: result.id as string,
            name,
            userId: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Receipt scan button */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isScanning}
            onClick={() => fileInputRef.current?.click()}
          >
            {isScanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            {isScanning ? "解析中..." : "レシートから読み取り"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleReceiptScan}
          />
        </div>

        {/* Date picker - shared across all entries */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>日付（共通）</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "yyyy/MM/dd")
                      ) : (
                        <span>日付を選択</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dynamic entries */}
        <div className="space-y-4">
          {fields.map((field, index) => {
            const isExpense = form.watch(`entries.${index}.isExpense`);
            return (
              <div
                key={field.id}
                className="relative border rounded-lg p-4 space-y-3"
              >
                {/* Entry header with remove button */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEntry(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Income/Expense toggle */}
                <FormField
                  control={form.control}
                  name={`entries.${index}.isExpense`}
                  render={({ field: entryField }) => (
                    <FormItem>
                      <Tabs
                        defaultValue={entryField.value ? "expense" : "income"}
                        onValueChange={(v) => {
                          const newIsExpense = v === "expense";
                          entryField.onChange(newIsExpense);
                          form.setValue(`entries.${index}.category`, "", {
                            shouldValidate: true,
                          });
                        }}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger
                            value="expense"
                            className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                          >
                            支出
                          </TabsTrigger>
                          <TabsTrigger
                            value="income"
                            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                          >
                            収入
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name={`entries.${index}.amount`}
                    render={({ field: entryField }) => (
                      <FormItem>
                        <FormLabel>金額</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...entryField}
                            onBlur={(e) => {
                              const value = e.target.value;
                              entryField.onBlur();
                              if (entryField.value === undefined) {
                                entryField.onChange(0);
                              } else {
                                entryField.onChange(Number(value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name={`entries.${index}.category`}
                    render={({ field: entryField }) => (
                      <FormItem>
                        <FormLabel>カテゴリ</FormLabel>
                        <CategorySelect
                          value={entryField.value}
                          onChange={entryField.onChange}
                          categories={categories}
                          currentType={isExpense ? "expense" : "income"}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Store */}
                <FormField
                  control={form.control}
                  name={`entries.${index}.storeName`}
                  render={({ field: entryField }) => (
                    <FormItem>
                      <FormLabel>店舗・サービス名</FormLabel>
                      <StoreSelect
                        value={entryField.value ?? ""}
                        onChange={(value) => {
                          form.setValue(`entries.${index}.storeName`, value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        stores={stores}
                        onCreateStore={handleCreateStore}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name={`entries.${index}.description`}
                  render={({ field: entryField }) => (
                    <FormItem>
                      <FormLabel>用途・メモ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            isExpense
                              ? "コンビニ、スーパーなど"
                              : "給料、賞与など"
                          }
                          {...entryField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Add entry button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addEntry}
        >
          <Plus className="mr-2 h-4 w-4" />
          項目を追加
        </Button>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !form.formState.isValid}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {fields.length}件を一括登録する
        </Button>
      </form>
    </Form>
  );
}
