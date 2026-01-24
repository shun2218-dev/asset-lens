import { describe, expect, it, vi, beforeEach } from "vitest";
import { getCategories } from "./get";
import { db } from "@/db";

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

// Mock mail client to avoid init error
vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe("getCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return categories", async () => {
    const mockCategories = [
      { id: "1", name: "Food", userId: null },
      { id: "2", name: "Custom", userId: "user-123" },
    ];

    // Mock db.select chain: select -> from -> where -> orderBy
    const orderByMock = vi.fn().mockResolvedValue(mockCategories);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await getCategories();

    expect(result).toHaveLength(2);
    expect(result).toEqual(mockCategories);
    expect(db.select).toHaveBeenCalled();
  });

  it("should return empty array if unauthorized", async () => {
    // Override auth mock to return null
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await getCategories();

    expect(result).toEqual([]);
    expect(db.select).not.toHaveBeenCalled();
  });

  it("should return empty array on database failure", async () => {
    // Mock failure
    const orderByMock = vi.fn().mockRejectedValue(new Error("DB Error"));
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await getCategories();

    expect(result).toEqual([]);
  });
});
