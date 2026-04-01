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

  const correlationId =
    request.headers.get("x-correlation-id") ?? crypto.randomUUID();

  if (isPublicPath(pathname)) {
    const response = NextResponse.next();
    response.headers.set("x-correlation-id", correlationId);
    return response;
  }

  const allowed = getAllowedCountries();
  if (allowed) {
    const country = (request as NextRequest & { geo?: { country?: string } })
      .geo?.country;
    if (country && !allowed.includes(country)) {
      return new NextResponse("Access denied", { status: 403 });
    }
  }

  const response = NextResponse.next({
    request: {
      headers: new Headers([
        ...request.headers.entries(),
        ["x-correlation-id", correlationId],
      ]),
    },
  });
  response.headers.set("x-correlation-id", correlationId);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
