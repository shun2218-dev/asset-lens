import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { GET } from "./route";

// Mock NextResponse
// Next.js source code might be complex to mock fully, but for unit tests we can mock the constructor or return value.
// GET returns `new NextResponse(...)` or `NextResponse.json(...)`.
// We can mock `next/server`
vi.mock("next/server", () => {
  // Basic mock for NextResponse
  const NextResponse = class {
    constructor(body: any, init: any) {
      (this as any).body = body;
      (this as any).status = init?.status || 200;
    }
    static json(body: any, init: any) {
      return {
        json: async () => body,
        status: init?.status || 200,
      };
    }
  };
  return { NextResponse };
});

// Mock db
vi.mock("@/db", () => {
  return {
    db: {
      select: vi.fn(),
      transaction: vi.fn(),
    },
  };
});

describe("Cron: process-subscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
  });

  it("should return 401 if unauthorized", async () => {
    const req = {
      headers: {
        get: vi.fn().mockReturnValue("Bearer wrong-secret"),
      },
    };
    const response = await GET(req as any);
    expect((response as any).status).toBe(401);
  });

  it("should return message if no subscriptions due", async () => {
    const req = {
      headers: {
        get: vi.fn().mockReturnValue("Bearer test-secret"),
      },
    };

    // Mock db.select to return empty
    // select() -> from() -> where()
    const whereMock = vi.fn().mockResolvedValue([]);
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    const response = await GET(req as any);

    // Check response
    // NextResponse.json returns object with json() method in our mock
    expect((response as any).status).toBe(200);
    const body = await (response as any).json();
    expect(body.message).toBe("No subscriptions due today.");
  });

  it("should process due subscriptions", async () => {
    const req = {
      headers: {
        get: vi.fn().mockReturnValue("Bearer test-secret"),
      },
    };

    const mockSub = {
      id: "sub-1",
      userId: "user-1",
      amount: 1000,
      name: "Netflix",
      category: "entertainment",
      billingCycle: "monthly",
      nextPaymentDate: new Date("2024-01-01"),
    };

    // Mock db.select to return one sub
    const whereMock = vi.fn().mockResolvedValue([mockSub]);
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.select as any).mockReturnValue({ from: fromMock });

    // Mock db.transaction
    // The implementation uses db.transaction(async (tx) => { ... })
    // We should execute the callback immediately with a mock tx object

    // Mock Transaction Object
    const txMock = {
      insert: vi.fn().mockReturnValue({ values: vi.fn() }),
      update: vi
        .fn()
        .mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
    };

    (db.transaction as any).mockImplementation(async (callback: any) => {
      return callback(txMock);
    });

    const response = await GET(req as any);

    const body = await (response as any).json();
    expect(body.success).toBe(true);
    expect(body.processed).toEqual(["Netflix"]);

    // Verify insert (created transaction)
    expect(txMock.insert).toHaveBeenCalled();

    // Verify update (next payment date)
    expect(txMock.update).toHaveBeenCalled();
  });
});
