import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseReceipt, parseReceiptBulk } from "./reciept-parser";

// Mock GoogleGenerativeAI with hoisting
const { mockGenerateContent, mockGetGenerativeModel, MockGoogleGenerativeAI } =
  vi.hoisted(() => {
    const mockGenerateContent = vi.fn();
    const mockGetGenerativeModel = vi.fn(() => ({
      generateContent: mockGenerateContent,
    }));
    const MockGoogleGenerativeAI = vi.fn(function () {
      return {
        getGenerativeModel: mockGetGenerativeModel,
      };
    });
    return {
      mockGenerateContent,
      mockGetGenerativeModel,
      MockGoogleGenerativeAI,
    };
  });

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: MockGoogleGenerativeAI,
}));

describe("parseReceipt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "mock-key";
  });

  it("should parse valid receipt data", async () => {
    const mockResponseText = JSON.stringify({
      amount: 1200,
      date: "2024-03-01",
      description: "Grocery Store",
      category: "food",
    });

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => mockResponseText,
      },
    });

    const result = await parseReceipt("base64data", "image/jpeg");

    expect(result).toEqual({
      amount: 1200,
      date: "2024-03-01",
      description: "Grocery Store",
      category: "food",
    });
  });

  it("should handle invalid date", async () => {
    const mockResponseText = JSON.stringify({
      amount: 1200,
      date: "invalid-date",
      description: "Store",
      category: "other",
    });

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => mockResponseText,
      },
    });

    const result = await parseReceipt("base64data", "image/jpeg");

    expect(result.date).toBeUndefined();
    expect(result.amount).toBe(1200);
  });

  it("should clean markdown code blocks from response", async () => {
    const mockResponseText = `\`\`\`json
    {
      "amount": 500,
      "description": "Coffee",
      "category": "food"
    }
    \`\`\``;

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => mockResponseText,
      },
    });

    const result = await parseReceipt("base64data", "image/jpeg");

    expect(result.amount).toBe(500);
  });

  it("should throw error if API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(parseReceipt("base64data", "image/jpeg")).rejects.toThrow(
      "GEMINI_API_KEY が設定されていません",
    );
  });

  it("should throw error on API failure", async () => {
    mockGenerateContent.mockRejectedValue(new Error("API Error"));

    await expect(parseReceipt("base64data", "image/jpeg")).rejects.toThrow(
      "解析処理に失敗しました",
    );
  });
});

describe("parseReceiptBulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "mock-key";
  });

  it("should parse receipt with multiple items", async () => {
    const mockResponseText = JSON.stringify({
      storeName: "イオン",
      date: "2026-03-29",
      items: [
        { amount: 298, description: "牛乳", category: "food" },
        { amount: 158, description: "パン", category: "food" },
        { amount: 498, description: "シャンプー", category: "daily" },
      ],
    });

    mockGenerateContent.mockResolvedValue({
      response: { text: () => mockResponseText },
    });

    const result = await parseReceiptBulk("base64data", "image/jpeg");

    expect(result.storeName).toBe("イオン");
    expect(result.date).toBe("2026-03-29");
    expect(result.items).toHaveLength(3);
    expect(result.items[0]).toEqual({
      amount: 298,
      description: "牛乳",
      category: "food",
    });
    expect(result.items[2]).toEqual({
      amount: 498,
      description: "シャンプー",
      category: "daily",
    });
  });

  it("should handle null values for unreadable fields", async () => {
    const mockResponseText = JSON.stringify({
      storeName: "コンビニ",
      date: null,
      items: [
        { amount: 150, description: null, category: null },
        { amount: null, description: "おにぎり", category: "food" },
      ],
    });

    mockGenerateContent.mockResolvedValue({
      response: { text: () => mockResponseText },
    });

    const result = await parseReceiptBulk("base64data", "image/jpeg");

    expect(result.storeName).toBe("コンビニ");
    expect(result.date).toBeNull();
    expect(result.items[0]).toEqual({
      amount: 150,
      description: null,
      category: null,
    });
    expect(result.items[1]).toEqual({
      amount: null,
      description: "おにぎり",
      category: "food",
    });
  });

  it("should return empty items when no items found", async () => {
    const mockResponseText = JSON.stringify({
      storeName: "テスト店",
      date: "2026-03-01",
      items: [],
    });

    mockGenerateContent.mockResolvedValue({
      response: { text: () => mockResponseText },
    });

    const result = await parseReceiptBulk("base64data", "image/jpeg");

    expect(result.storeName).toBe("テスト店");
    expect(result.items).toEqual([]);
  });

  it("should handle missing storeName", async () => {
    const mockResponseText = JSON.stringify({
      storeName: null,
      date: "2026-03-01",
      items: [{ amount: 100, description: "商品A", category: "other" }],
    });

    mockGenerateContent.mockResolvedValue({
      response: { text: () => mockResponseText },
    });

    const result = await parseReceiptBulk("base64data", "image/jpeg");

    expect(result.storeName).toBeNull();
  });

  it("should throw error if API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(
      parseReceiptBulk("base64data", "image/jpeg"),
    ).rejects.toThrow("GEMINI_API_KEY が設定されていません");
  });

  it("should throw error on API failure", async () => {
    mockGenerateContent.mockRejectedValue(new Error("API Error"));

    await expect(
      parseReceiptBulk("base64data", "image/jpeg"),
    ).rejects.toThrow("レシートの解析処理に失敗しました");
  });
});
