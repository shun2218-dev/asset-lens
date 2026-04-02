import { type NextRequest, NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isHoneypotPath, proxy } from "./proxy";

// Mock NextResponse
vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  class MockHeaders {
    private map = new Map<string, string>();
    set(key: string, value: string) {
      this.map.set(key, value);
    }
    get(key: string) {
      return this.map.get(key) ?? null;
    }
    entries() {
      return this.map.entries();
    }
  }
  class MockNextResponse {
    body: string;
    status: number;
    headers: MockHeaders;
    constructor(body: string, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = new MockHeaders();
    }
    static next(_opts?: unknown) {
      const res = new MockNextResponse("", { status: 200 });
      return Object.assign(res, { type: "next" });
    }
    static redirect(url: string, opts?: { status?: number }) {
      const res = new MockNextResponse("", { status: opts?.status ?? 302 });
      return Object.assign(res, { type: "redirect", url });
    }
  }
  return {
    ...actual,
    NextResponse: MockNextResponse,
  };
});

function createRequest(pathname: string, country?: string): NextRequest {
  return {
    nextUrl: { pathname },
    headers: new Map<string, string>(),
    geo: country ? { country } : {},
  } as unknown as NextRequest;
}

describe("proxy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should allow public paths from any country", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP");
    const result = proxy(createRequest("/", "CN"));
    expect(result).toMatchObject({ type: "next" });
  });

  it("should allow /login from any country", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP");
    const result = proxy(createRequest("/login", "RU"));
    expect(result).toMatchObject({ type: "next" });
  });

  it("should allow /contact from any country", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP");
    const result = proxy(createRequest("/contact", "KP"));
    expect(result).toMatchObject({ type: "next" });
  });

  it("should allow /api/auth paths from any country", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP");
    const result = proxy(createRequest("/api/auth/callback", "CN"));
    expect(result).toMatchObject({ type: "next" });
  });

  it("should allow whitelisted country access to authenticated routes", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP");
    const result = proxy(createRequest("/dashboard", "JP"));
    expect(result).toMatchObject({ type: "next" });
  });

  it("should block non-whitelisted country from /dashboard", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP");
    const result = proxy(createRequest("/dashboard", "CN"));
    expect(result).toBeInstanceOf(NextResponse);
  });

  it("should block non-whitelisted country from /transaction", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP");
    const result = proxy(createRequest("/transaction", "RU"));
    expect(result).toBeInstanceOf(NextResponse);
  });

  it("should allow all countries when ALLOWED_COUNTRIES is *", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "*");
    const result = proxy(createRequest("/dashboard", "CN"));
    expect(result).toMatchObject({ type: "next" });
  });

  it("should allow all countries when ALLOWED_COUNTRIES is not set", () => {
    // No env set = allow all
    const result = proxy(createRequest("/dashboard", "CN"));
    expect(result).toMatchObject({ type: "next" });
  });

  it("should allow multiple countries from env", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP,US,GB");
    const resultJP = proxy(createRequest("/dashboard", "JP"));
    expect(resultJP).toMatchObject({ type: "next" });

    const resultUS = proxy(createRequest("/dashboard", "US"));
    expect(resultUS).toMatchObject({ type: "next" });

    const resultCN = proxy(createRequest("/dashboard", "CN"));
    expect(resultCN).toBeInstanceOf(NextResponse);
  });

  it("should allow when no geo data is available", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP");
    const result = proxy(createRequest("/dashboard"));
    expect(result).toMatchObject({ type: "next" });
  });
});

describe("isHoneypotPath", () => {
  // --- Exact path matches ---
  it.each([
    "/wp-login.php",
    "/wp-admin",
    "/wp-admin/",
    "/wp-config.php",
    "/xmlrpc.php",
    "/phpmyadmin",
    "/pma",
    "/.env",
    "/.env.local",
    "/.env.production",
    "/.git/config",
    "/.git/HEAD",
    "/.htaccess",
    "/.htpasswd",
    "/config.php",
    "/server-status",
    "/administrator/",
    "/admin.php",
    "/shell",
    "/cmd",
    "/backup.sql",
    "/dump.sql",
  ])("should match exact path: %s", (path) => {
    expect(isHoneypotPath(path)).toBe(true);
  });

  // --- Case insensitive ---
  it.each([
    "/WP-LOGIN.PHP",
    "/Wp-Admin/",
    "/PhpMyAdmin/",
    "/.ENV",
    "/.Git/Config",
  ])("should match case-insensitively: %s", (path) => {
    expect(isHoneypotPath(path)).toBe(true);
  });

  // --- Prefix matches ---
  it.each([
    "/wp-admin/setup-config.php",
    "/wp-content/uploads/shell.php",
    "/wp-includes/js/wp-emoji.js",
    "/cgi-bin/test.cgi",
    "/.git/objects/pack/info",
    "/.svn/entries",
  ])("should match prefix path: %s", (path) => {
    expect(isHoneypotPath(path)).toBe(true);
  });

  // --- Extension matches ---
  it.each([
    "/index.php",
    "/admin/login.php",
    "/test.asp",
    "/default.aspx",
    "/api.jsp",
    "/exec.cgi",
    "/wordpress/wp-admin/setup-config.php",
  ])("should match extension: %s", (path) => {
    expect(isHoneypotPath(path)).toBe(true);
  });

  // --- False positive safety: legitimate paths must NOT match ---
  it.each([
    "/",
    "/login",
    "/signup",
    "/dashboard",
    "/transaction",
    "/settings",
    "/api/auth/callback",
    "/api/e2e",
    "/_next/static/chunks/main.js",
    "/favicon.ico",
    "/opengraph-image",
    "/sitemap.xml",
    "/contact",
    "/privacy",
    "/terms",
  ])("should NOT match legitimate path: %s", (path) => {
    expect(isHoneypotPath(path)).toBe(false);
  });
});

describe("proxy honeypot integration", () => {
  it("should rickroll WordPress scanner", () => {
    const result = proxy(createRequest("/wp-login.php")) as any;
    expect(result.type).toBe("redirect");
    expect(result.url).toContain("youtube.com");
    expect(result.url).toContain("dQw4w9WgXcQ");
  });

  it("should rickroll PHP file probe", () => {
    const result = proxy(createRequest("/admin/config.php")) as any;
    expect(result.type).toBe("redirect");
    expect(result.url).toContain("dQw4w9WgXcQ");
  });

  it("should rickroll .env probe", () => {
    const result = proxy(createRequest("/.env")) as any;
    expect(result.type).toBe("redirect");
  });

  it("should NOT rickroll legitimate paths", () => {
    const result = proxy(createRequest("/dashboard", "JP")) as any;
    expect(result.type).toBe("next");
  });

  it("should rickroll before country check", () => {
    vi.stubEnv("ALLOWED_COUNTRIES", "JP");
    // Even from Japan, malicious paths get rickrolled
    const result = proxy(createRequest("/wp-login.php", "JP")) as any;
    expect(result.type).toBe("redirect");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });
});
