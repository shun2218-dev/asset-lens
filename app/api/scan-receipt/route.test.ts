import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

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

// Mock parseReceipt
vi.mock("@/lib/analysis/reciept-parser", () => ({
  parseReceipt: vi.fn(),
}));

import { parseReceipt } from "@/lib/analysis/reciept-parser";

describe("API: Scan Receipt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should scan receipt successfully", async () => {
    const req = {
      json: async () => ({ image: "base64-data" }),
    };

    const mockResult = {
      amount: 1000,
      date: "2024-01-01",
      description: "Test",
      category: "food",
    };

    (parseReceipt as any).mockResolvedValue(mockResult);

    const response = await POST(req as any);
    const body = await (response as any).json();

    expect(body).toEqual(mockResult);
    expect(parseReceipt).toHaveBeenCalledWith("base64-data", "image/jpeg");
  });

  it("should return 400 if image missing", async () => {
    const req = {
      json: async () => ({}),
    };

    const response = await POST(req as any);
    expect((response as any).status).toBe(400);
    const body = await (response as any).json();
    expect(body.error).toBe("Image data is required");
  });

  it("should return error on parser failure", async () => {
    const req = {
      json: async () => ({ image: "base64-data" }),
    };

    (parseReceipt as any).mockRejectedValue(new Error("Parse Failed"));

    const response = await POST(req as any);
    expect((response as any).status).toBe(500);
  });
});
