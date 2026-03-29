import { GoogleGenerativeAI } from "@google/generative-ai";
import { format, isValid, parse } from "date-fns";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/constants";

export type ParsedReceipt = {
  amount?: number;
  date?: string; // YYYY-MM-DD
  description?: string;
  category?: string;
};

// Base64文字列とMIMEタイプを受け取って解析する純粋な関数
export async function parseReceipt(
  base64Data: string,
  mimeType: string,
): Promise<ParsedReceipt> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const categories = EXPENSE_CATEGORY_OPTIONS.map((c) => c.value).join(", ");
  const prompt = `
    このレシート画像を解析し、以下の情報を抽出してJSON形式で返してください。
    
    1. date: 日付 (YYYY-MM-DD形式)。見つからない場合はnull。
    2. amount: 合計金額 (数値)。通貨記号は除外。
    3. description: 店名または主な品目 (日本語、短く)。
    4. category: 内容に基づき、次の中から最も適切なものを1つ選択: [${categories}]。不明な場合は "other"。

    出力はJSONのみを含めてください。
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const text = result.response.text();
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
    throw new Error("解析処理に失敗しました");
  }
}

// -- Bulk receipt parsing (multiple line items) --

export type ParsedReceiptItem = {
  amount: number | null;
  description: string | null; // 商品名（短縮）
  category: string | null; // slug or null
};

export type ParsedReceiptBulk = {
  storeName: string | null;
  date: string | null; // YYYY-MM-DD
  items: ParsedReceiptItem[];
};

export async function parseReceiptBulk(
  base64Data: string,
  mimeType: string,
): Promise<ParsedReceiptBulk> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const categories = EXPENSE_CATEGORY_OPTIONS.map((c) => c.value).join(", ");
  const prompt = `
    このレシート画像を解析し、以下の情報をJSON形式で返してください。

    {
      "storeName": "店舗名またはサービス名（レシートの上部に記載）。読み取れない場合はnull",
      "date": "日付 (YYYY-MM-DD形式)。読み取れない場合はnull",
      "items": [
        {
          "amount": "商品の金額 (数値、通貨記号なし)。読み取れない場合はnull",
          "description": "商品名や内容 (日本語、短く簡潔に)。読み取れない場合はnull",
          "category": "次のカテゴリから最も適切なものを1つ: [${categories}]。不明な場合はnull"
        }
      ]
    }

    重要なルール:
    - 合計金額の行は items に含めないでください。個別の商品のみを含めてください。
    - 税金や値引きの行も items に含めないでください。
    - 読み取れない項目は無理に推測せず、必ずnullにしてください。
    - items が1つも読み取れない場合は空の配列 [] を返してください。
    - 出力はJSONのみを含めてください。
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const text = result.response.text();
    const jsonString = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonString);

    // Validate date
    let validDate: string | null = null;
    if (typeof data.date === "string") {
      const parsedDate = parse(data.date, "yyyy-MM-dd", new Date());
      if (isValid(parsedDate)) {
        validDate = format(parsedDate, "yyyy-MM-dd");
      }
    }

    // Validate items
    const items: ParsedReceiptItem[] = Array.isArray(data.items)
      ? data.items.map((item: Record<string, unknown>) => ({
          amount: typeof item.amount === "number" ? item.amount : null,
          description:
            typeof item.description === "string" ? item.description : null,
          category: typeof item.category === "string" ? item.category : null,
        }))
      : [];

    return {
      storeName: typeof data.storeName === "string" ? data.storeName : null,
      date: validDate,
      items,
    };
  } catch (error) {
    console.error("Gemini Bulk Analysis Error:", error);
    throw new Error("レシートの解析処理に失敗しました");
  }
}
