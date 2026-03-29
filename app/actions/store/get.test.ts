import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getStores } from "./get";

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

describe("getStores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return stores for authenticated user", async () => {
    const mockStores = [
      { id: "store-1", name: "コンビニA", userId: "user-123" },
      { id: "store-2", name: "スーパーB", userId: "user-123" },
    ];

    const orderByMock = vi.fn().mockResolvedValue(mockStores);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await getStores();

    expect(result).toEqual(mockStores);
    expect(db.select).toHaveBeenCalled();
  });

  it("should return empty array on error", async () => {
    (db.select as any).mockImplementation(() => {
      throw new Error("DB Error");
    });

    const result = await getStores();

    expect(result).toEqual([]);
  });
});
