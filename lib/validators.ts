import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().positive("金額は1以上で入力してください"),
  description: z.string().min(1, "用途を入力してください"),
  category: z.string().min(1, "カテゴリを選択してください"),
  date: z.date({
    error: (issue) => {
        if (issue.input === undefined) return "日付を選択してください";
        return "無効な日付です"
    } ,
  }),
  isExpense: z.boolean(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;