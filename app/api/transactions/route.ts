import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { auth } from "@/lib/auth/auth";

// GET: 取引一覧の取得
export async function GET(_req: Request) {
  try {
    // 1. セッションチェック (iOSからのリクエストもCookieで認証されます)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. DBからデータ取得 (ログインユーザーのデータのみ)
    const data = await db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, session.user.id))
      .orderBy(desc(transaction.date))
      .limit(50); // 一旦50件取得とします

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: 取引の追加
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ボディからJSONを受け取る
    const body = await req.json();
    const { amount, description, isExpense, category, date } = body;

    // バリデーション (簡易)
    if (typeof amount !== "number" || !description || !category) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // DBに保存
    const newTransaction = await db
      .insert(transaction)
      .values({
        userId: session.user.id,
        amount,
        description,
        isExpense,
        category,
        date: new Date(date), // 文字列をDate型に変換
      })
      .returning();

    return NextResponse.json(newTransaction[0]);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
