import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { importData } from "./import";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "user-123" },
      }),
    },
  },
}));

// Mock db
vi.mock("@/db", () => {
  return {
    db: {
      select: vi.fn(),
      insert: vi.fn(),
      delete: vi.fn(), // If needed
    },
  };
});

// Mock mail client
vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
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

  const setupDbSelectMock = (existingTransactions: any[] = []) => {
    // db.select is called in Promise.all
    // 1. Transaction select (existing)
    // 2. Category select (all)

    // We can simulate this by returning a mock that responds differently based on .from() call or just sequential calls
    // However, db.select() returns a query builder.
    // The implementation does: db.select().from(transaction)... AND db.select().from(category)

    // Simplified specific query mocking might be hard without deep inspection of 'from'.
    // We can mock the Promise.all result by mocking the execution of the promises if we could,
    // but here we mock the builder chain.

    const fromMock = vi.fn().mockImplementation((table: any) => {
      // Check table name or object structure if feasible.
      // For now, let's just make the chain flexible.
      return {
        where: vi.fn().mockResolvedValue(existingTransactions), // for transaction query
        // If it's category query, it doesn't call where, it awaits directly or similar?
        // The code: db.select().from(category) -> await
        // So for category, it returns a Promise-like object that resolves to categories.
        then: (resolve: any) => resolve(mockCategories),
      };
    });

    (db.select as any).mockReturnValue({ from: fromMock });
  };

  it("should successfully import valid CSV data", async () => {
    // Mock Promise.all [transactions, categories]
    // Since we cannot easily distinguish the parallel calls in simple mock,
    // We will assume the code handles the mocked return values correctly if we structure them well.
    // Actually, `from(transaction).where(...)` returns a promise.
    // `from(category)` returns a promise.

    const transactionQueryMock = {
      where: vi.fn().mockResolvedValue([]), // No existing transactions
    };

    const categoryQueryMock = Promise.resolve(mockCategories);

    // We need to differentiate based on the table passed to `from`.
    // We can use a Map or checks on the argument.
    // Since `transaction` and `category` are imported from schema, they are objects.

    // Import schema objects to compare
    const { category, transaction } = await import("@/db/schema");

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === transaction) return transactionQueryMock;
      if (table === category) return categoryQueryMock;
      return Promise.resolve([]);
    });

    (db.select as any).mockReturnValue({ from: fromMock });

    // Mock insert
    const insertValuesMock = vi.fn().mockResolvedValue([]);
    // db.insert() returns the builder which has .values()
    (db.insert as any).mockReturnValue({ values: insertValuesMock });

    // Prepare FormData
    const csvContent = `日付,内容,金額,カテゴリ,収支タイプ
2024-01-01,ランチ,1000,食費,支出
2024-01-02,電車,500,交通費,支出`;

    // Create a mock FormData object
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
    expect(result.count).toBe(2);
    expect(result.skipped).toBe(0);

    expect(db.insert).toHaveBeenCalled();
    // Verify mapped categories
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          category: "food",
          categoryId: "cat-1",
          amount: 1000,
        }),
        expect.objectContaining({
          category: "transport",
          categoryId: "cat-2",
          amount: 500,
        }),
      ]),
    );
  });

  it("should return error if no file provided", async () => {
    const formData = new FormData();
    const result = await importData(formData);
    expect(result.error).toBe("ファイルが選択されていません");
  });

  it("should skip duplicates", async () => {
    const { category, transaction } = await import("@/db/schema");

    // Mock existing transaction matches the first CSV row
    // Signature: 2024-01-01_1000_ランチ_food
    const existingTx = [
      {
        date: new Date("2024-01-01"),
        amount: 1000,
        description: "ランチ",
        category: "food",
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
    expect(result.count).toBe(1); // Only 1 new inserted
    expect(result.skipped).toBe(1); // 1 skipped
  });
});
