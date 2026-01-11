// カテゴリIDから日本語への変換マップ

// 支出
export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  food: "食費",
  transport: "交通費",
  daily: "日用品",
  entertainment: "交際費・娯楽",
  utilities: "光熱費",
  housing: "住居費",
  medical: "医療費",
  fashion: "衣服・美容",
  other: "その他",
};

// 収入
export const INCOME_CATEGORY_LABELS: Record<string, string> = {
  salary: "給与",
  bonus: "賞与",
  business: "事業・副業",
  investment: "投資・配当",
  extra: "臨時収入",
  other: "その他",
};

// 支出用カテゴリ
export const EXPENSE_CATEGORY_OPTIONS = Object.entries(
  EXPENSE_CATEGORY_LABELS,
).map(([value, label]) => ({
  value,
  label,
}));

// 収入用カテゴリ
export const INCOME_CATEGORY_OPTIONS = Object.entries(
  INCOME_CATEGORY_LABELS,
).map(([value, label]) => ({
  value,
  label,
}));

export const SECURITY_CONFIG = {
  otp: {
    length: 6,
    expiresIn: 300,
  },
};
