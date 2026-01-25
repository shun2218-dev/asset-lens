import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth, requireGuest } from "./guard";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { redirect } from "next/navigation";

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";

describe("Auth Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("should return session if authenticated", async () => {
      const mockSession = { user: { id: "1" } };
      (auth.api.getSession as any).mockResolvedValue(mockSession);

      const session = await requireAuth();
      expect(session).toEqual(mockSession);
      expect(redirect).not.toHaveBeenCalled();
    });

    it("should redirect to login if unauthenticated", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);

      await requireAuth();
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("requireGuest", () => {
    it("should redirect to dashboard if authenticated", async () => {
      const mockSession = { user: { id: "1" } };
      (auth.api.getSession as any).mockResolvedValue(mockSession);

      await requireGuest();
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("should do nothing if unauthenticated", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);

      await requireGuest();
      expect(redirect).not.toHaveBeenCalled();
    });
  });
});
