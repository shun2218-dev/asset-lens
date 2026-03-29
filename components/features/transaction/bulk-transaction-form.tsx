"use client";

import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SelectCategory } from "@/db/schema";
import { useBulkTransactionForm } from "@/hooks/use-bulk-transaction-form";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

interface BulkTransactionFormProps {
  categories: SelectCategory[];
}

export function BulkTransactionForm({ categories }: BulkTransactionFormProps) {
  const { data: session } = useSession();

  const { form, fields, addEntry, removeEntry, onSubmit, isSubmitting } =
    useBulkTransactionForm();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) return null;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
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
                          form.setValue(
                            `entries.${index}.category`,
                            "",
                            { shouldValidate: true },
                          );
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
