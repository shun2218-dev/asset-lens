import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { importData } from "./import";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

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
      insert: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("importData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCategories = [
    { id: "cat-1", slug: "food", name: "食費" },
    { id: "cat-2", slug: "transport", name: "交通費" },
    { id: "cat-99", slug: "other", name: "その他" },
  ];

  it("should successfully import valid CSV data", async () => {
    const transactionQueryMock = {
      where: vi.fn().mockResolvedValue([]),
    };

    const categoryQueryMock = Promise.resolve(mockCategories);

    const { category, transaction } = await import("@/db/schema");

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === transaction) return transactionQueryMock;
      if (table === category) return categoryQueryMock;
      return Promise.resolve([]);
    });

    (db.select as any).mockReturnValue({ from: fromMock });

    const insertValuesMock = vi.fn().mockResolvedValue([]);
    (db.insert as any).mockReturnValue({ values: insertValuesMock });

    const csvContent = `日付,内容,金額,カテゴリ,収支タイプ
2024-01-01,ランチ,1000,食費,支出
2024-01-02,電車,500,交通費,支出`;

    const mockFile = {
      text: () => Promise.resolve(csvContent),
      name: "test.csv",
      type: "text/csv",
      size: csvContent.length,
    };

    const mockFormData = {
      get: (key: string) => (key === "file" ? mockFile : null),
    };

    const result = await importData(mockFormData as any);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(2);
      expect(result.data.skipped).toBe(0);
    }

    expect(db.insert).toHaveBeenCalled();
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          categoryId: "cat-1",
          amount: 1000,
        }),
        expect.objectContaining({
          categoryId: "cat-2",
          amount: 500,
        }),
      ]),
    );
  });

  it("should return error if no file provided", async () => {
    const formData = new FormData();
    const result = await importData(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("No file selected");
    }
  });

  it("should skip duplicates", async () => {
    const { category, transaction } = await import("@/db/schema");

    const existingTx = [
      {
        date: new Date("2024-01-01"),
        amount: 1000,
        description: "ランチ",
        category: "food",
        categoryId: "cat-1",
      },
    ];

    const transactionQueryMock = {
      where: vi.fn().mockResolvedValue(existingTx),
    };
    const categoryQueryMock = Promise.resolve(mockCategories);

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === transaction) return transactionQueryMock;
      if (table === category) return categoryQueryMock;
      return Promise.resolve([]);
    });

    (db.select as any).mockReturnValue({ from: fromMock });

    const insertValuesMock = vi.fn().mockResolvedValue([]);
    (db.insert as any).mockReturnValue({ values: insertValuesMock });

    const csvContent = `日付,内容,金額,カテゴリ,収支タイプ
2024-01-01,ランチ,1000,食費,支出
2024-01-03,ディナー,5000,食費,支出`;

    const mockFile = {
      text: () => Promise.resolve(csvContent),
      name: "test.csv",
      type: "text/csv",
      size: csvContent.length,
    };
    const mockFormData = {
      get: (key: string) => (key === "file" ? mockFile : null),
    };

    const result = await importData(mockFormData as any);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(1);
      expect(result.data.skipped).toBe(1);
    }
  });
});
