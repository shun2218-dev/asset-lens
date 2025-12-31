"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { analyzeReceipt } from "@/app/actions/analyze-receipt";
import { addTransaction } from "@/app/actions/transaction";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  type TransactionFormValues,
  transactionSchema,
} from "@/lib/validators";

export function TransactionForm() {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      category: "",
      date: new Date(),
      isExpense: true,
    },
  });

  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vercelの制限(4.5MB)を考慮し、余裕を持って4MBを上限とする
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

    if (file.size > MAX_FILE_SIZE) {
      toast.error("ファイルサイズが大きすぎます(上限4MB)", {
        description: "別の画像を選択するか、サイズを小さくしてください。",
      });

      // 入力をリセットして中断
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsScanning(true);
      toast.loading("レシートを解析中...", { id: "scan-toast" });

      const formData = new FormData();
      formData.append("file", file);

      // Server Actionを呼び出し
      const result = await analyzeReceipt(formData);

      toast.success("解析が完了しました", { id: "scan-toast" });

      // 結果をフォームに反映
      if (result.amount)
        form.setValue("amount", result.amount, { shouldValidate: true });
      if (result.description)
        form.setValue("description", result.description, {
          shouldValidate: true,
        });
      if (result.category)
        form.setValue("category", result.category, { shouldValidate: true });
      if (result.date) {
        // 文字列(YYYY-MM-DD)をDateオブジェクトに変換
        form.setValue("date", new Date(result.date), { shouldValidate: true });
      }

      // 必要ならトースト通知などをここで出す
    } catch (error) {
      console.error(error);
      toast.error("読み取りに失敗しました", { id: "scan-toast" });
    } finally {
      setIsScanning(false);
      // 同じファイルを再度選べるようにリセット
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  async function onSubmit(data: TransactionFormValues) {
    try {
      const result = await addTransaction(data);
      if (result.success) {
        form.reset({
          amount: 0,
          description: "",
          category: "",
          date: new Date(),
          isExpense: true,
        });

        toast.success("登録しました");
      } else {
        toast.error("登録に失敗しました");
      }
    } catch (error) {
      toast.error("予期せぬエラーが発生しました");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            onClick={() => fileInputRef.current?.click()}
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Input placeholder="コンビニ、スーパーなど" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          登録する
        </Button>
      </form>
    </Form>
  );
}
