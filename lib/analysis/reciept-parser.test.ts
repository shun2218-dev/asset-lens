import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseReceipt } from "./reciept-parser";

// Mock GoogleGenerativeAI
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
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
