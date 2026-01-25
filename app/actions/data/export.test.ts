import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { exportData } from "./export";

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

describe("exportData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = [
    {
      t: {
        id: "tx-1",
        date: new Date("2024-01-01"),
        amount: 1000,
        description: "ランチ",
        category: "food",
        isExpense: true,
      },
      c: {
        id: "cat-1",
        slug: "food",
        name: "食費",
      },
    },
    {
      t: {
        id: "tx-2",
        date: new Date("2024-01-02"),
        amount: 200000,
        description: "給与",
        category: "salary",
        isExpense: false,
      },
      c: {
        id: "cat-2",
        slug: "salary",
        name: "給与",
      },
    },
  ];

  it("should export CSV correctly", async () => {
    // Mock db.select chain
    // select -> from -> leftJoin -> where -> orderBy
    const orderByMock = vi.fn().mockResolvedValue(mockData);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const leftJoinMock = vi.fn().mockReturnValue({ where: whereMock });
    const fromMock = vi.fn().mockReturnValue({ leftJoin: leftJoinMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const csv = await exportData();

    // Check header
    expect(csv).toContain("日付,内容,金額,カテゴリ,収支タイプ");

    // Check rows
    // Row 1: 2024-01-01,"ランチ",1000,食費,支出
    // Note: implementation uses EXPENSE_CATEGORY_LABELS map or similar
    // The implementation might translate 'food' slug to '食費' label if defined in constants.
    // If not defined, it uses slug. "food" -> "食費" usually.

    // We expect basic CSV structure matches
    expect(csv).toContain("2024-01-01");
    expect(csv).toContain("ランチ");
    expect(csv).toContain("1000");
    expect(csv).toContain("食費"); // Mapped from 'food'

    expect(csv).toContain("2024-01-02");
    expect(csv).toContain("給与");
    expect(csv).toContain("200000");
    expect(csv).toContain("収入"); // isExpense: false
    expect(csv).toContain("salary"); // 'salary' slug not in expense map, so remains as slug
  });

  it("should throw error if unauthorized", async () => {
    // Override auth mock to return null
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    await expect(exportData()).rejects.toThrow("Unauthorized");
  });
});
