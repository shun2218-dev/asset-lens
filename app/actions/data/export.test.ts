import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { exportData } from "./export";

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
  resend: { emails: { send: vi.fn() } },
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
    const orderByMock = vi.fn().mockResolvedValue(mockData);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const leftJoinMock = vi.fn().mockReturnValue({ where: whereMock });
    const fromMock = vi.fn().mockReturnValue({ leftJoin: leftJoinMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await exportData();

    expect(result.success).toBe(true);
    if (result.success) {
      const csv = result.data;

      expect(csv).toContain("日付,内容,金額,カテゴリ,収支タイプ");
      expect(csv).toContain("2024-01-01");
      expect(csv).toContain("ランチ");
      expect(csv).toContain("1000");
      expect(csv).toContain("食費");
      expect(csv).toContain("2024-01-02");
      expect(csv).toContain("給与");
      expect(csv).toContain("200000");
      expect(csv).toContain("収入");
      expect(csv).toContain("salary");
    }
  });

  it("should return error if unauthorized", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await exportData();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Please sign in to continue");
    }
  });
});
