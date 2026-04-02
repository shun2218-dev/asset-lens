import { type NextRequest, NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "./proxy";

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
