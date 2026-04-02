import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  new: {
    label: "新規",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  in_progress: {
    label: "対応中",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  resolved: {
    label: "解決済み",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  closed: {
    label: "クローズ",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  },
} as const;

type InquiryStatus = keyof typeof STATUS_CONFIG;

interface InquiryStatusBadgeProps {
  status: string;
}

export function InquiryStatusBadge({ status }: InquiryStatusBadgeProps) {
  const config = STATUS_CONFIG[status as InquiryStatus] ?? STATUS_CONFIG.new;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export const CATEGORY_LABELS: Record<string, string> = {
  question: "質問",
  bug: "バグ報告",
  feature: "機能要望",
  other: "その他",
};

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(
  ([value, { label }]) => ({ value, label }),
);
