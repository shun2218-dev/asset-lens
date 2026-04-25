import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getExportData } from "./get-export-data";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "user-123" },
      }),
    },
  },
}));

vi.mock("@/db", () => {
  return {
    db: {
      select: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

function setupDbMock(rows: unknown[]) {
  const orderByMock = vi.fn().mockResolvedValue(rows);
  const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
  const leftJoinMock = vi.fn().mockReturnValue({ where: whereMock });
  const fromMock = vi.fn().mockReturnValue({ leftJoin: leftJoinMock });
  (db.select as any).mockReturnValue({ from: fromMock });
}

describe("getExportData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRows = [
    {
      t: {
        id: "1",
        amount: 50000,
        description: "給与",
        storeName: null,
        date: new Date("2024-03-01"),
        isExpense: false,
        category: "salary",
        categoryId: "cat-1",
      },
      c: { id: "cat-1", name: "給与", slug: "salary" },
    },
    {
      t: {
        id: "2",
        amount: 3000,
        description: "ランチ",
        storeName: "コンビニ",
        date: new Date("2024-03-05"),
        isExpense: true,
        category: "food",
        categoryId: "cat-2",
      },
      c: { id: "cat-2", name: "食費", slug: "food" },
    },
    {
      t: {
        id: "3",
        amount: 1500,
        description: "電車",
        storeName: "JR",
        date: new Date("2024-03-10"),
        isExpense: true,
        category: "transport",
        categoryId: "cat-3",
      },
      c: { id: "cat-3", name: "交通費", slug: "transport" },
    },
  ];

  it("should return formatted export data", async () => {
    setupDbMock(mockRows);

    const result = await getExportData("2024-03");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.month).toBe("2024-03");
    expect(result.data.transactions).toHaveLength(3);
    expect(result.data.transactions[0].date).toBe("2024/03/01");
    expect(result.data.transactions[0].type).toBe("収入");
    expect(result.data.transactions[1].type).toBe("支出");
  });

  it("should calculate summary correctly", async () => {
    setupDbMock(mockRows);

    const result = await getExportData("2024-03");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.summary.totalIncome).toBe(50000);
    expect(result.data.summary.totalExpense).toBe(4500);
    expect(result.data.summary.balance).toBe(45500);
  });

  it("should calculate category breakdown sorted by amount", async () => {
    setupDbMock(mockRows);

    const result = await getExportData("2024-03");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.categoryBreakdown).toEqual([
      { category: "食費", amount: 3000 },
      { category: "交通費", amount: 1500 },
    ]);
  });

  it("should handle empty month", async () => {
    setupDbMock([]);

    const result = await getExportData("2024-04");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.transactions).toHaveLength(0);
    expect(result.data.summary.totalIncome).toBe(0);
    expect(result.data.summary.totalExpense).toBe(0);
  });

  it("should use category name from relation", async () => {
    setupDbMock(mockRows);

    const result = await getExportData("2024-03");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.transactions[1].category).toBe("食費");
  });
});
