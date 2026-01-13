"use server";

import { analyzeImage } from "@/lib/analyze-service";

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

  return await analyzeImage(base64Data, file.type);
}
