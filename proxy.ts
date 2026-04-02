import { type NextRequest, NextResponse } from "next/server";

// ─── Honeypot: Rickroll malicious scanners ───────────────────────

/** YouTube Rickroll URL — the classic never-gonna-give-you-up */
const RICKROLL_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

/**
 * Well-known paths probed by automated vulnerability scanners.
 * These are public knowledge (OWASP, security research) — not secrets.
 * Keeping them in code is intentional for auditability.
 */
const HONEYPOT_EXACT_PATHS = new Set([
  // WordPress
  "/wp-login.php",
  "/wp-admin",
  "/wp-admin/",
  "/wp-config.php",
  "/xmlrpc.php",
  "/wp-cron.php",
  "/wp-settings.php",
  "/wp-mail.php",
  "/wp-signup.php",
  "/wp-trackback.php",
  "/wp-blog-header.php",
  "/wp-load.php",
  "/wp-links-opml.php",

  // phpMyAdmin
  "/phpmyadmin",
  "/phpmyadmin/",
  "/pma",
  "/pma/",
  "/myadmin",
  "/myadmin/",
  "/phpMyAdmin/",
  "/dbadmin",
  "/dbadmin/",
  "/mysql",
  "/mysql/",
  "/mysqladmin",
  "/mysqladmin/",

  // Sensitive files
  "/.env",
  "/.env.local",
  "/.env.production",
  "/.env.backup",
  "/.git/config",
  "/.git/HEAD",
  "/.gitignore",
  "/.htaccess",
  "/.htpasswd",
  "/.DS_Store",
  "/config.php",
  "/configuration.php",
  "/config.yml",
  "/config.json",
  "/database.yml",
  "/credentials.json",

  // Server status probes
  "/server-status",
  "/server-info",
  "/status",
  "/_debug",

  // Admin panels / CMS
  "/administrator/",
  "/admin.php",
  "/admin/login",
  "/admin/login.php",
  "/user/login",

  // CGI / shell probes
  "/cgi-bin/",
  "/shell",
  "/cmd",
  "/console",

  // Backup & dump files
  "/backup/",
  "/backup.sql",
  "/backup.zip",
  "/dump.sql",
  "/db.sql",
  "/database.sql",
]);

/**
 * Path prefixes that indicate automated scanning.
 * Any path starting with these will be trapped.
 */
const HONEYPOT_PATH_PREFIXES = [
  "/wp-admin/",
  "/wp-content/",
  "/wp-includes/",
  "/cgi-bin/",
  "/.git/",
  "/.svn/",
  "/.well-known/security.txt", // legitimate but often probed
];

/**
 * File extensions that should never appear in a Next.js app.
 * Matches any path ending with these extensions.
 */
const HONEYPOT_EXTENSIONS = [".php", ".asp", ".aspx", ".jsp", ".cgi"];

/**
 * Check if a request path is a known malicious probe.
 */
export function isHoneypotPath(pathname: string): boolean {
  // Normalize: lowercase for comparison
  const lower = pathname.toLowerCase();

  // Exact match
  if (HONEYPOT_EXACT_PATHS.has(lower)) return true;

  // Prefix match
  if (HONEYPOT_PATH_PREFIXES.some((prefix) => lower.startsWith(prefix)))
    return true;

  // Extension match
  if (HONEYPOT_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;

  return false;
}

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🎣 Honeypot: Rickroll malicious scanners before any other logic
  if (isHoneypotPath(pathname)) {
    return NextResponse.redirect(RICKROLL_URL, { status: 302 });
  }

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
