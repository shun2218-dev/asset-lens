"use client";

import { format } from "date-fns";
import { CalendarIcon, Camera, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CategorySelect } from "@/components/features/category/category-select";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Note: Fixed double slash
import type { SelectCategory } from "@/db/schema";
import { useTransactionForm } from "@/hooks/use-transaction-form";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  initialData?: {
    userId: string;
    amount: number;
    description: string;
    category: string;
    date: Date;
    isExpense: boolean;
  };
  id?: string; // 編集モードの場合はIDを渡す
  categories: SelectCategory[];
  onSuccess?: () => void; // 完了時の処理
  onCancel?: () => void; // キャンセル時の処理
}

export function TransactionForm({
  initialData,
  id,
  categories,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const { data: session } = useSession();

  const {
    form,
    isScanning,
    fileInputRef,
    handleFileChange,
    triggerFileInput,
    onSubmit,
    // isSubmitting,
    // isValid,
  } = useTransactionForm({
    initialData,
    id,
    onSuccess,
  });

  const isExpense = form.watch("isExpense");

  // Fix: Hydration mismatch prevention
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) return null;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        {!id && (
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isScanning}
              onClick={triggerFileInput}
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  解析中...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  レシートを読み取る
                </>
              )}
            </Button>
          </div>
        )}

        <FormField
          control={form.control}
          name="isExpense"
          render={({ field }) => (
            <FormItem>
              <Tabs
                defaultValue={field.value ? "expense" : "income"}
                onValueChange={(v) => {
                  const newIsExpense = v === "expense";
                  field.onChange(newIsExpense);
                  form.setValue("category", newIsExpense ? "food" : "salary", {
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>日付</FormLabel>
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
                          <span>Pick a date</span>
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

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>金額</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onBlur={(e) => {
                      const value = e.target.value;
                      field.onBlur();
                      if (field.value === undefined) {
                        field.onChange(0);
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カテゴリ</FormLabel>
              <CategorySelect
                value={field.value}
                onChange={field.onChange}
                categories={categories}
                currentType={isExpense ? "expense" : "income"}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用途・メモ</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    isExpense ? "コンビニ、スーパーなど" : "給料、賞与など"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="w-1/2"
              onClick={onCancel}
            >
              キャンセル
            </Button>
          )}
          <Button
            type="submit"
            className={id ? "w-1/2" : "w-full"}
            disabled={
              form.formState.isSubmitting ||
              isScanning ||
              !form.formState.isValid
            }
          >
            {(isScanning || form.formState.isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {id ? "更新する" : "登録する"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
