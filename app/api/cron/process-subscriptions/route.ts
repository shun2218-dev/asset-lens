import { addMonths, addYears } from "date-fns";
import { and, eq, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscription, transaction } from "@/db/schema";

export async function GET(req: Request) {
  // 1. セキュリティチェック (Vercel Cronからのアクセスか確認)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. 「次回支払日」が「現在時刻」を過ぎているアクティブなサブスクを取得
    // ※ 日本時間の0時に実行する場合、UTCだと前日の15時なので、
    //    多少のズレを考慮して「現在時刻以下(lte)」で検索するのが安全です。
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

    // 3. 該当するサブスクを処理
    const results = await Promise.all(
      dueSubscriptions.map(async (sub) => {
        return db.transaction(async (tx) => {
          // A. 家計簿(Transaction)にコピーを作成
          await tx.insert(transaction).values({
            userId: sub.userId,
            amount: sub.amount,
            description: sub.name, // "Netflix" など
            category: sub.category,
            date: new Date(), // 記録日は「今」
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
