import { z } from "zod";

export const transactionSchema = z.object({
  userId: z.string().min(1, "ユーザーIDが必要です"),
  amount: z
    .number("金額は数字で入力してください")
    .positive("金額は1以上で入力してください"),
  description: z.string().min(1, "用途を入力してください"),
  category: z.string().min(1, "カテゴリを選択してください"),
  date: z.date({
    error: (issue) => {
      if (issue.input === undefined) return "日付を選択してください";
      return "無効な日付です";
    },
  }),
  isExpense: z.boolean(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const signInSchema = z.object({
  email: z
    .email("メールアドレスの形式で入力してください")
    .min(1, "この項目は必須です"),
  password: z.string().min(1, "この項目は必須です"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .max(32, "パスワードは32文字以下で入力してください")
  .refine((password) => /[A-Z]/.test(password), {
    error: "パスワードは大文字を含めてください",
  })
  .refine((password) => /[a-z]/.test(password), {
    error: "パスワードは小文字を含めてください",
  })
  .refine((password) => /[0-9]/.test(password), {
    error: "パスワードは数字を含めてください",
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    error: "パスワードは記号を含めてください",
  });

export const signUpSchema = z
  .object({
    name: z.string().min(1, "この項目は必須です"),
    email: z
      .email("メールアドレスの形式で入力してください")
      .min(1, "この項目は必須です"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "この項目は必須です"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const subscriptionSchema = z.object({
  name: z.string().min(1, "サービス名を入力してください"),
  amount: z
    .number({ error: "金額は数字で入力してください" })
    .positive("金額は1以上で入力してください"),
  billingCycle: z.enum(["monthly", "yearly"], {
    error: "支払いサイクルを選択してください",
  }),
  nextPaymentDate: z.date({
    error: "次回の支払日を選択してください",
  }),
  category: z.string().min(1, "カテゴリを選択してください"),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export const profileSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  image: z.any().optional(), // File object handling in client, refined via server action or separate check
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
