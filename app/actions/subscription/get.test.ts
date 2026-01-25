import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getSubscription } from "./get";

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

describe("getSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return subscriptions", async () => {
    const mockSubscriptions = [
      { id: "sub-1", name: "Netflix", amount: 1500 },
      { id: "sub-2", name: "Spotify", amount: 980 },
    ];

    // Mock db.select chain: select -> from -> where -> orderBy
    const orderByMock = vi.fn().mockResolvedValue(mockSubscriptions);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await getSubscription();

    expect(result).toHaveLength(2);
    expect(result).toEqual(mockSubscriptions);
    expect(db.select).toHaveBeenCalled();
  });

  it("should return empty array if unauthorized", async () => {
    // Override auth mock to return null
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await getSubscription();

    expect(result).toEqual([]);
    expect(db.select).not.toHaveBeenCalled();
  });

  it("should return empty array on database failure", async () => {
    // Mock failure
    const orderByMock = vi.fn().mockRejectedValue(new Error("DB Error"));
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const result = await getSubscription();

    expect(result).toEqual([]);
  });
});
