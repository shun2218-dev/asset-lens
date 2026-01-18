"use server";

import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Papa from "papaparse";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";

// ラベルからIDへの逆引きマップを作成 (例: "食費" -> "food")
const CATEGORY_LABEL_TO_ID = Object.entries(EXPENSE_CATEGORY_LABELS).reduce<
  Record<string, string>
>((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

export async function importData(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "認証されていません" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "ファイルが選択されていません" };
  }

  const text = await file.text();

  // 1. CSV解析
  const { data } = Papa.parse<string[]>(text, {
    header: false, // ヘッダー行をスキップするために配列として読み込む
    skipEmptyLines: true,
  });

  // ヘッダー行を除去（1行目が"日付"で始まる場合）
  const rows = data[0][0] === "日付" ? data.slice(1) : data;

  if (rows.length === 0) {
    return { error: "データが含まれていません" };
  }

  try {
    // 2. 既存データの取得 (重複チェック用)
    // 全件取得してメモリ上でチェックする
    const existingTransactions = await db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, session.user.id));

    // 重複判定用の署名セットを作成 (日付_金額_内容_カテゴリ)
    const existingSignatures = new Set(
      existingTransactions.map(
        (t) =>
          `${format(t.date, "yyyy-MM-dd")}_${t.amount}_${t.description}_${t.category}`,
      ),
    );

    const newTransactions: (typeof transaction.$inferInsert)[] = [];
    let skippedCount = 0;

    // 3. データ変換と重複チェック
    for (const row of rows) {
      // CSV: 日付, 内容, 金額, カテゴリ, 収支タイプ
      const [dateStr, description, amountStr, categoryLabel, typeLabel] = row;

      if (!dateStr || !amountStr) continue;

      // カテゴリIDの特定 (一致しなければ "other")
      const categoryId = CATEGORY_LABEL_TO_ID[categoryLabel] || "other";
      const isExpense = typeLabel === "支出";
      const amount = parseInt(amountStr.replace(/,/g, ""), 10); // カンマ除去

      // 重複チェック
      const signature = `${dateStr}_${amount}_${description}_${categoryId}`;
      if (existingSignatures.has(signature)) {
        skippedCount++;
        continue;
      }

      newTransactions.push({
        userId: session.user.id,
        date: new Date(dateStr),
        description: description || "使途不明",
        amount: amount,
        category: categoryId,
        isExpense: isExpense,
      });
    }

    // 4. 一括登録
    if (newTransactions.length > 0) {
      await db.insert(transaction).values(newTransactions);
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/settings");

    return {
      success: true,
      count: newTransactions.length,
      skipped: skippedCount,
    };
  } catch (error) {
    console.error("Import Error:", error);
    return { error: "インポート中にエラーが発生しました" };
  }
}
