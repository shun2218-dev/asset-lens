import { addMonths, addYears } from "date-fns";
import { and, eq, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { category, subscription, transaction } from "@/db/schema";

export async function GET(req: Request) {
  // 1. セキュリティチェック (Vercel Cronからのアクセスか確認)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. 「次回支払日」が「現在時刻」を過ぎているアクティブなサブスクを取得
    const dueSubscriptions = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.status, "active"),
          lte(subscription.nextPaymentDate, new Date()),
        ),
      );

    if (dueSubscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions due today." });
    }

    // Fetch all categories for slug lookup
    const allCategories = await db.select().from(category);
    const slugToIdMap = new Map(allCategories.map((c) => [c.slug, c.id]));

    // 3. 該当するサブスクを処理
    const results = await Promise.all(
      dueSubscriptions.map(async (sub) => {
        return db.transaction(async (tx) => {
          // Resolve category slug to categoryId
          const categoryId =
            slugToIdMap.get(sub.category) ||
            slugToIdMap.get("other") ||
            allCategories[0]?.id;

          if (!categoryId) {
            throw new Error(`No category found for subscription: ${sub.name}`);
          }

          // A. 家計簿(Transaction)にコピーを作成
          await tx.insert(transaction).values({
            userId: sub.userId,
            amount: sub.amount,
            description: "サブスク",
            storeName: sub.name,
            categoryId,
            date: new Date(),
            isExpense: true,
          });

          // B. 次回の支払日を計算
          const nextDate =
            sub.billingCycle === "yearly"
              ? addYears(sub.nextPaymentDate, 1)
              : addMonths(sub.nextPaymentDate, 1);

          // C. サブスク情報の更新
          await tx
            .update(subscription)
            .set({
              nextPaymentDate: nextDate,
              updatedAt: new Date(),
            })
            .where(eq(subscription.id, sub.id));

          return sub.name;
        });
      }),
    );

    return NextResponse.json({
      success: true,
      processed: results,
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
