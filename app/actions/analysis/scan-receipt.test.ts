import { beforeEach, describe, expect, it, vi } from "vitest";
import * as parser from "@/lib/analysis/reciept-parser";
import { scanReceipt, scanReceiptBulk } from "./scan-receipt";

// Mock parseReceipt and parseReceiptBulk
vi.mock("@/lib/analysis/reciept-parser", () => ({
  parseReceipt: vi.fn(),
  parseReceiptBulk: vi.fn(),
}));

describe("scanReceipt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully scan a receipt", async () => {
    const mockParsedReceipt = {
      amount: 1000,
      date: "2024-01-01",
      description: "Test",
      category: "food",
    };

    (parser.parseReceipt as any).mockResolvedValue(mockParsedReceipt);

    // Create a mock File
    const fileContent = "fake-image-content";
    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(Buffer.from(fileContent)),
      type: "image/jpeg",
      size: fileContent.length,
    };

    const mockFormData = {
      get: (key: string) => (key === "file" ? mockFile : null),
    };

    const result = await scanReceipt(mockFormData as any);

    expect(result).toEqual(mockParsedReceipt);
    expect(parser.parseReceipt).toHaveBeenCalled();

    // Check if base64 conversion happened (indirectly via what parseReceipt receives if we could snoop,
    // but here we trust the mock call arguments)
    const expectedBase64 = Buffer.from(fileContent).toString("base64");
    expect(parser.parseReceipt).toHaveBeenCalledWith(
      expectedBase64,
      "image/jpeg",
    );
  });

  it("should throw error if file is missing", async () => {
    const mockFormData = {
      get: () => null,
    };

    await expect(scanReceipt(mockFormData as any)).rejects.toThrow(
      "ファイルが見つかりません",
    );
  });
});

describe("scanReceiptBulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully scan a receipt in bulk mode", async () => {
    const mockParsedBulk = {
      storeName: "テスト店",
      date: "2026-03-29",
      items: [
        { amount: 298, description: "牛乳", category: "food" },
        { amount: 158, description: "パン", category: "food" },
      ],
    };

    (parser.parseReceiptBulk as any).mockResolvedValue(mockParsedBulk);

    const fileContent = "fake-image-content";
    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(Buffer.from(fileContent)),
      type: "image/jpeg",
      size: fileContent.length,
    };

    const mockFormData = {
      get: (key: string) => (key === "file" ? mockFile : null),
    };

    const result = await scanReceiptBulk(mockFormData as any);

    expect(result).toEqual(mockParsedBulk);
    expect(parser.parseReceiptBulk).toHaveBeenCalled();

    const expectedBase64 = Buffer.from(fileContent).toString("base64");
    expect(parser.parseReceiptBulk).toHaveBeenCalledWith(
      expectedBase64,
      "image/jpeg",
    );
  });

  it("should throw error if file is missing", async () => {
    const mockFormData = {
      get: () => null,
    };

    await expect(scanReceiptBulk(mockFormData as any)).rejects.toThrow(
      "ファイルが見つかりません",
    );
  });
});
