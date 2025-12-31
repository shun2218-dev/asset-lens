// カテゴリIDから日本語への変換マップ
export const CATEGORY_LABELS: Record<string, string> = {
  food: "食費",
  transport: "交通費",
  daily: "日用品",
  entertainment: "交際費・娯楽",
  other: "その他",
};

// FormのSelect用に配列化して扱いやすくしておく
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);
