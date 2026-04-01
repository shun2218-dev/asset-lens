import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";

/**
 * Test-only API endpoint for E2E fixture operations.
 * Guarded by E2E_SECRET — returns 404 when not configured.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.E2E_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authHeader = request.headers.get("x-e2e-secret");
  if (authHeader !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { action, email, userId } = body;

  switch (action) {
    case "verify-email": {
      if (!email) {
        return NextResponse.json(
          { error: "email is required" },
          { status: 400 },
        );
      }
      const user = await db.query.user.findFirst({
        where: eq(schema.user.email, email),
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      await db
        .update(schema.user)
        .set({ emailVerified: true })
        .where(eq(schema.user.id, user.id));
      return NextResponse.json({ success: true, userId: user.id });
    }

    case "delete-user": {
      const id = userId || null;
      if (id) {
        await db.delete(schema.user).where(eq(schema.user.id, id));
      } else if (email) {
        const user = await db.query.user.findFirst({
          where: eq(schema.user.email, email),
        });
        if (user) {
          await db.delete(schema.user).where(eq(schema.user.id, user.id));
        }
      }
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 },
      );
  }
}
