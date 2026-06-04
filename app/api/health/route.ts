import { NextResponse } from "next/server";

/**
 * Health check endpoint for API status monitoring.
 * Returns a simple JSON response indicating the service is operational.
 */
export function GET() {
  return NextResponse.json(
    { status: "ok", timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: { "Cache-Control": "no-cache" },
    },
  );
}
