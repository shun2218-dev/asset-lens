import type { ExportData } from "@/app/actions/export/get-export-data";

/**
 * Generate CSV string with BOM for Excel compatibility.
 * Columns: 日付, 種別, カテゴリ, 内容, 店舗, 金額
 */
export function generateCsv(data: ExportData): string {
  const BOM = "\uFEFF";
  const header = ["日付", "種別", "カテゴリ", "内容", "店舗", "金額"];

  const rows = data.transactions.map((t) => [
    t.date,
    t.type,
    t.category,
    escapeCsvField(t.description),
    escapeCsvField(t.storeName),
    String(t.amount),
  ]);

  // Summary footer
  rows.push([]);
  rows.push(["", "", "", "", "収入合計", String(data.summary.totalIncome)]);
  rows.push(["", "", "", "", "支出合計", String(data.summary.totalExpense)]);
  rows.push(["", "", "", "", "収支", String(data.summary.balance)]);

  const lines = [header, ...rows].map((row) => row.join(","));
  return BOM + lines.join("\n");
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string,
): void {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
