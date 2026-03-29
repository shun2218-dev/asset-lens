"use client";

import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import type { SelectSubscription } from "@/db/schema";
import { useSubscriptionForm } from "@/hooks/use-subscription-form";
import { cn } from "@/lib/utils";

interface SubscriptionFormProps {
  onSuccess?: () => void;
  editTarget?: SelectSubscription | null;
  onCancel?: () => void;
}

export function SubscriptionForm({
  onSuccess,
  editTarget,
  onCancel,
}: SubscriptionFormProps) {
  const { form, isPending, isEditing, onSubmit } = useSubscriptionForm({
    onSuccess,
    editTarget,
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>サービス名</FormLabel>
              <FormControl>
                <Input placeholder="例: Netflix" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>金額 (円)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1000"
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

          <FormField
            control={form.control}
            name="billingCycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>支払いサイクル</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">毎月</SelectItem>
                    <SelectItem value="yearly">毎年</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nextPaymentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>次回の支払日</FormLabel>
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
                    disabled={(date) => date < new Date("1900-01-01")}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* カテゴリは「subscription」固定 (hidden) */}
        <input type="hidden" {...form.register("category")} />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "更新する" : "登録する"}
          </Button>
          {isEditing && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              キャンセル
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
