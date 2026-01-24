import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET, POST, PUT, DELETE } from "./route";
import { db } from "@/db";

// Mock NextResponse
vi.mock("next/server", () => {
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
      update: vi.fn(),
      delete: vi.fn(),
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

describe("API: Transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return transactions list", async () => {
        const mockData = [{
            t: { id: "tx-1", amount: 100 },
            c: { slug: "food" }
        }];
        
        // Mock chain
        const limitMock = vi.fn().mockResolvedValue(mockData);
        const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
        const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
        const leftJoinMock = vi.fn().mockReturnValue({ where: whereMock });
        const fromMock = vi.fn().mockReturnValue({ leftJoin: leftJoinMock });
        (db.select as any).mockReturnValue({ from: fromMock });

        const req = {}; // Request not used in logic except for auth check which is mocked
        const response = await GET(req as any);
        
        const body = await (response as any).json();
        expect(body).toHaveLength(1);
        expect(body[0].id).toBe("tx-1");
    });
  });

  describe("POST", () => {
      it("should create transaction", async () => {
          const req = {
              json: async () => ({
                  amount: 1000,
                  description: "test",
                  isExpense: true,
                  category: "cat-1",
                  date: "2024-01-01"
              })
          };

          // Mock category lookup
          const catLimitMock = vi.fn().mockResolvedValue([{ slug: "food" }]);
          const catWhereMock = vi.fn().mockReturnValue({ limit: catLimitMock });
          const catFromMock = vi.fn().mockReturnValue({ where: catWhereMock });
          (db.select as any).mockReturnValue({ from: catFromMock });

          // Mock insert
          const returningMock = vi.fn().mockResolvedValue([{ id: "new-tx" }]);
          const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
          (db.insert as any).mockReturnValue({ values: valuesMock });

          const response = await POST(req as any);
          const body = await (response as any).json();
          
          expect(body.id).toBe("new-tx");
      });
  });

  describe("PUT", () => {
      it("should update transaction", async () => {
          const req = {
              json: async () => ({
                  id: "tx-1",
                  amount: 2000,
                  description: "updated",
                  isExpense: true,
                  category: "cat-1",
                  date: "2024-01-01"
              })
          };

           // Mock category lookup (re-used structure needed)
          const catLimitMock = vi.fn().mockResolvedValue([{ slug: "food" }]);
          const catWhereMock = vi.fn().mockReturnValue({ limit: catLimitMock });
          const catFromMock = vi.fn().mockReturnValue({ where: catWhereMock });
          (db.select as any).mockReturnValue({ from: catFromMock });

          // Mock update
          const returningMock = vi.fn().mockResolvedValue([{ id: "tx-1", amount: 2000 }]);
          const whereUpdateMock = vi.fn().mockReturnValue({ returning: returningMock });
          const setMock = vi.fn().mockReturnValue({ where: whereUpdateMock });
          (db.update as any).mockReturnValue({ set: setMock });

          const response = await PUT(req as any);
          const body = await (response as any).json();
          
          expect(body.amount).toBe(2000);
      });
  });

  describe("DELETE", () => {
      it("should delete transaction", async () => {
          const req = {
              url: "http://localhost/api/transactions?id=tx-1"
          };
          
          // Mock delete
          const returningMock = vi.fn().mockResolvedValue([{ id: "tx-1" }]);
          const whereDeleteMock = vi.fn().mockReturnValue({ returning: returningMock });
          (db.delete as any).mockReturnValue({ where: whereDeleteMock });

          const response = await DELETE(req as any);
          const body = await (response as any).json();
          
          expect(body.success).toBe(true);
      });
  });
});
