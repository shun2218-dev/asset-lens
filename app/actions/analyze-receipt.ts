"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { format, isValid, parse } from "date-fns";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/constants";

type AnalyzeResult = {
  amount?: number;
  date?: string; // YYYY-MM-DD
  description?: string;
  category?: string;
};

export async function analyzeReceipt(
  formData: FormData,
): Promise<AnalyzeResult> {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("ファイルが見つかりません");
  }

  // 画像をBase64に変換
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  // Gemini APIの初期化
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません");
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  // 高速で安価な Flash モデルを使用
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  // プロンプトの作成
  const categories = EXPENSE_CATEGORY_OPTIONS.map((c) => c.value).join(", ");
  const prompt = `
    このレシート画像を解析し、以下の情報を抽出してJSON形式で返してください。
    
    1. date: 日付 (YYYY-MM-DD形式)。見つからない場合はnull。
    2. amount: 合計金額 (数値)。通貨記号は除外。
    3. description: 店名または主な品目 (日本語、短く)。
    4. category: 内容に基づき、次の中から最も適切なものを1つ選択: [${categories}]。不明な場合は "other"。

    出力はJSONのみを含めてください。Markdownのコードブロックは不要です。
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // JSON部分を抽出 (Markdown記法 ```json ... ``` が含まれる場合があるため除去)
    const jsonString = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonString);

    let validDate: string | undefined;

    if (typeof data.date === "string") {
      const parsedDate = parse(data.date, "yyyy-MM-dd", new Date());

      if (isValid(parsedDate)) {
        validDate = format(parsedDate, "yyyy-MM-dd");
      }
    }

    return {
      amount: typeof data.amount === "number" ? data.amount : undefined,
      date: validDate,
      description: data.description,
      category: data.category,
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("レシートの解析に失敗しました");
  }
}
