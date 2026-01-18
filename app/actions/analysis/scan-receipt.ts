"use server";

import {
  type ParsedReceipt,
  parseReceipt,
} from "@/lib/analysis/reciept-parser";

export async function scanReceipt(formData: FormData): Promise<ParsedReceipt> {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("ファイルが見つかりません");
  }

  // 画像をBase64に変換
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  return await parseReceipt(base64Data, file.type);
}
