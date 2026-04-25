import { describe, expect, it } from "vitest";
import type { ExportData } from "@/app/actions/export/get-export-data";
import { generateCsv } from "./csv";

const mockData: ExportData = {
  month: "2024-03",
  transactions: [
    {
      date: "2024/03/01",
      type: "収入",
      category: "給与",
      description: "3月分給与",
      storeName: "",
      amount: 300000,
    },
    {
      date: "2024/03/05",
      type: "支出",
      category: "食費",
      description: "スーパーで買い物",
      storeName: "イオン",
      amount: 5000,
    },
    {
      date: "2024/03/10",
      type: "支出",
      category: "交通費",
      description: "定期券",
      storeName: "JR東日本",
      amount: 15000,
    },
  ],
  summary: {
    totalIncome: 300000,
    totalExpense: 20000,
    balance: 280000,
  },
  categoryBreakdown: [
    { category: "交通費", amount: 15000 },
    { category: "食費", amount: 5000 },
  ],
};

describe("generateCsv", () => {
  it("should start with BOM for Excel compatibility", () => {
    const csv = generateCsv(mockData);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("should include header row", () => {
    const csv = generateCsv(mockData);
    const lines = csv.split("\n");
    // Skip BOM by checking from position 1
    expect(lines[0]).toContain("日付,種別,カテゴリ,内容,店舗,金額");
  });

  it("should include all transaction rows", () => {
    const csv = generateCsv(mockData);
    const lines = csv.split("\n");
    expect(lines[1]).toContain("2024/03/01");
    expect(lines[1]).toContain("収入");
    expect(lines[1]).toContain("300000");
    expect(lines[2]).toContain("2024/03/05");
    expect(lines[3]).toContain("2024/03/10");
  });

  it("should include summary footer", () => {
    const csv = generateCsv(mockData);
    expect(csv).toContain("収入合計,300000");
    expect(csv).toContain("支出合計,20000");
    expect(csv).toContain("収支,280000");
  });

  it("should escape fields with commas", () => {
    const data: ExportData = {
      ...mockData,
      transactions: [
        {
          date: "2024/03/01",
          type: "支出",
          category: "食費",
          description: "牛乳, パン, 卵",
          storeName: "",
          amount: 800,
        },
      ],
    };
    const csv = generateCsv(data);
    expect(csv).toContain('"牛乳, パン, 卵"');
  });

  it("should handle empty transactions", () => {
    const data: ExportData = {
      ...mockData,
      transactions: [],
      summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
    };
    const csv = generateCsv(data);
    expect(csv).toContain("収入合計,0");
  });
});
