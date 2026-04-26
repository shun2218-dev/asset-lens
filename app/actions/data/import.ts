"use server";

import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";

// Reverse lookup map: label -> slug (e.g., "食費" -> "food")
const CATEGORY_LABEL_TO_ID = Object.entries(EXPENSE_CATEGORY_LABELS).reduce<
  Record<string, string>
>((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

interface ImportResult {
  count: number;
  skipped: number;
}

export const importData = createSafeAction<FormData, ImportResult>(
  async (formData, userId) => {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file selected");
    }

    const text = await file.text();

    // 1. Parse CSV
    const { data } = Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: true,
    });

    // Remove header row if present
    const rows = data[0][0] === "日付" ? data.slice(1) : data;

    if (rows.length === 0) {
      throw new Error("No data found in file");
    }

    // 2. Fetch existing data for duplicate check
    const [existingTransactions, allCategories] = await Promise.all([
      db.select().from(transaction).where(eq(transaction.userId, userId)),
      db.select().from(category),
    ]);

    const categorySlugToIdMap = new Map<string, string>();
    allCategories.forEach((c) => {
      categorySlugToIdMap.set(c.slug, c.id);
    });

    const existingSignatures = new Set(
      existingTransactions.map(
        (t) =>
          `${format(t.date, "yyyy-MM-dd")}_${t.amount}_${t.description}_${t.categoryId}`,
      ),
    );

    const newTransactions: (typeof transaction.$inferInsert)[] = [];
    let skippedCount = 0;

    // 3. Transform and deduplicate
    for (const row of rows) {
      const [dateStr, description, amountStr, categoryLabel, typeLabel] = row;

      if (!dateStr || !amountStr) continue;

      // Label -> Slug -> UUID
      const slug = CATEGORY_LABEL_TO_ID[categoryLabel] || "other";
      let categoryId = categorySlugToIdMap.get(slug);

      if (!categoryId && slug !== "other") {
        categoryId = categorySlugToIdMap.get("other");
      }

      const isExpense = typeLabel === "支出";
      const amount = parseInt(amountStr.replace(/,/g, ""), 10);

      // Duplicate check
      const signature = `${dateStr}_${amount}_${description}_${categoryId || slug}`;
      if (existingSignatures.has(signature)) {
        skippedCount++;
        continue;
      }

      if (!categoryId) {
        // If no category found, skip the row
        skippedCount++;
        continue;
      }

      newTransactions.push({
        userId,
        date: new Date(dateStr),
        description: description || "Unknown",
        amount: amount,
        categoryId,
        isExpense: isExpense,
      });
    }

    // 4. Batch insert
    if (newTransactions.length > 0) {
      await db.insert(transaction).values(newTransactions);
    }

    revalidatePath("/dashboard");
    revalidatePath("/transaction");
    revalidatePath("/settings");

    return {
      count: newTransactions.length,
      skipped: skippedCount,
    };
  },
  { errorMessage: "Failed to import data" },
);
