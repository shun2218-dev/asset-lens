import { lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { session } from "@/db/schema";

export async function GET() {
  try {
    // expiresAt が現在時刻より前（lt = less than）のものを削除
    const deleted = await db
      .delete(session)
      .where(lt(session.expiresAt, new Date()));

    return NextResponse.json({ success: true, deletedCount: deleted.rowCount });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
