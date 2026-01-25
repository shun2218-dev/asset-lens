"use server";

import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Papa from "papaparse";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { auth } from "@/lib/auth";
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
    const [existingTransactions, allCategories] = await Promise.all([
      db
        .select()
        .from(transaction)
        .where(eq(transaction.userId, session.user.id)),
      db.select().from(category),
    ]);

    // カテゴリのマッピング用 (Label -> Slug -> ID, or Label -> ID direct if name matches?)
    // CONSTANTS mapping defines: "食費" -> "food". "food" is the slug.
    // We need to find the category where slug === "food".

    const categorySlugToIdMap = new Map<string, string>();
    allCategories.forEach((c) => {
      categorySlugToIdMap.set(c.slug, c.id);
    });

    const existingSignatures = new Set(
      existingTransactions.map(
        (t) =>
          `${format(t.date, "yyyy-MM-dd")}_${t.amount}_${t.description}_${t.category}`, // strict signature might need checking
      ),
    );

    const newTransactions: (typeof transaction.$inferInsert)[] = [];
    let skippedCount = 0;

    // 3. データ変換と重複チェック
    for (const row of rows) {
      // CSV: 日付, 内容, 金額, カテゴリ, 収支タイプ
      const [dateStr, description, amountStr, categoryLabel, typeLabel] = row;

      if (!dateStr || !amountStr) continue;

      // 1. Label ("食費") -> Slug ("food")
      const slug = CATEGORY_LABEL_TO_ID[categoryLabel] || "other";

      // 2. Slug ("food") -> ID (UUID)
      // もしDBにそのslugがない場合は "other" のIDを探す、それもなければ...
      let categoryId = categorySlugToIdMap.get(slug);

      // fallback to 'other' category if not found
      if (!categoryId && slug !== "other") {
        categoryId = categorySlugToIdMap.get("other");
      }

      // If still no categoryId (e.g. even 'other' is missing), we might have a problem.
      // For now, assume 'other' exists or we skip/error.
      // strict schema says categoryId is nullable? No, schema says reference.
      // But transaction.categoryId is nullable reference.
      // legacy category is not null.

      const isExpense = typeLabel === "支出";
      const amount = parseInt(amountStr.replace(/,/g, ""), 10); // カンマ除去

      // 重複チェック (legacy signature check uses slug in 'category' field)
      const signature = `${dateStr}_${amount}_${description}_${slug}`;
      if (existingSignatures.has(signature)) {
        skippedCount++;
        continue;
      }

      newTransactions.push({
        userId: session.user.id,
        date: new Date(dateStr),
        description: description || "使途不明",
        amount: amount,
        category: slug, // Legacy column
        categoryId: categoryId || null, // New column
        isExpense: isExpense,
      });
    }

    // 4. 一括登録
    if (newTransactions.length > 0) {
      await db.insert(transaction).values(newTransactions);
    }

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
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
