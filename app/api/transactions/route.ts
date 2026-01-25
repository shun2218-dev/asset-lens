import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";
import { auth } from "@/lib/auth";

// GET: 取引一覧の取得
export async function GET(_req: Request) {
  try {
    // 1. セッションチェック (iOSからのリクエストもCookieで認証)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. DBからデータ取得 (ログインユーザーのデータのみ)
    const rows = await db
      .select({
        t: transaction,
        c: category,
      })
      .from(transaction)
      .leftJoin(category, eq(transaction.categoryId, category.id))
      .where(eq(transaction.userId, session.user.id))
      .orderBy(desc(transaction.date))
      .limit(50); // 一旦50件取得

    const data = rows.map(({ t, c }) => ({
      ...t,
      category: c?.slug ?? t.category, // Relation priority
    }));

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
    const { amount, description, isExpense, category: categoryId, date } = body;

    // バリデーション (簡易)
    if (typeof amount !== "number" || !description || !categoryId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // カテゴリ情報を取得
    const [categoryData] = await db
      .select()
      .from(category)
      .where(eq(category.id, categoryId))
      .limit(1);

    if (!categoryData) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    // DBに保存
    const newTransaction = await db
      .insert(transaction)
      .values({
        userId: session.user.id,
        amount,
        description,
        isExpense,
        category: categoryData.slug, // Legacy
        categoryId,
        date: new Date(date),
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

// PUT: 取引の更新
export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      amount,
      description,
      isExpense,
      category: categoryId,
      date,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 },
      );
    }

    // カテゴリ情報を取得
    const [categoryData] = await db
      .select()
      .from(category)
      .where(eq(category.id, categoryId))
      .limit(1);

    if (!categoryData) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    // 更新実行 (自分のデータかつIDが一致するもの)
    const updated = await db
      .update(transaction)
      .set({
        amount,
        description,
        isExpense,
        category: categoryData.slug, // Legacy
        categoryId,
        date: new Date(date), // 日付の変換
      })
      .where(
        and(eq(transaction.id, id), eq(transaction.userId, session.user.id)),
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE: 取引の削除
export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // URLからIDを取得
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 },
      );
    }

    // DBから削除 (自分のデータであること、かつIDが一致すること)
    // ※ AND条件にすることで、他人のデータを消さない
    const deleted = await db
      .delete(transaction)
      .where(
        and(eq(transaction.id, id), eq(transaction.userId, session.user.id)),
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
