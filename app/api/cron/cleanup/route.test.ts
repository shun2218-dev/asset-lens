import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "./route";
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

// Mock db
vi.mock("@/db", () => {
  return {
    db: {
      delete: vi.fn(),
    },
  };
});

describe("Cron: cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete expired sessions", async () => {
    // Mock db.delete chain
    const whereMock = vi.fn().mockResolvedValue({ rowCount: 5 });
    (db.delete as any).mockReturnValue({ where: whereMock });

    const response = await GET();

    const body = await (response as any).json();
    expect(body.success).toBe(true);
    expect(body.deletedCount).toBe(5);
    
    expect(db.delete).toHaveBeenCalled();
  });

  it("should handle database errors", async () => {
    const whereMock = vi.fn().mockImplementation(() => {
        throw new Error("DB Error");
    });
    (db.delete as any).mockReturnValue({ where: whereMock });

    const response = await GET();

    expect((response as any).status).toBe(500);
    const body = await (response as any).json();
    expect(body.success).toBe(false);
  });
});
