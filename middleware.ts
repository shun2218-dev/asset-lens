import { type NextRequest, NextResponse } from "next/server";

function getAllowedCountries(): string[] | null {
  const env = process.env.ALLOWED_COUNTRIES;
  if (!env || env === "*") return null;
  return env.split(",").map((c) => c.trim().toUpperCase());
}

/** Public paths that are accessible from any country */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/contact",
  "/privacy",
  "/terms",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/opengraph-image",
  "/sitemap.xml",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip geo-check for public pages and static assets
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Geo-blocking for authenticated routes
  const allowed = getAllowedCountries();
  if (allowed) {
    // request.geo is injected by Vercel Edge Runtime (not in Next.js types)
    const country = (request as NextRequest & { geo?: { country?: string } })
      .geo?.country;
    if (country && !allowed.includes(country)) {
      return new NextResponse("Access denied", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
