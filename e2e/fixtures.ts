import { test as base } from "@playwright/test";
import crypto from "crypto";

type AuthUser = {
  id: string;
  email: string;
  name: string;
};

const E2E_SECRET = process.env.E2E_SECRET || "";

export const test = base.extend<{ authUser: AuthUser }>({
  authUser: async ({ page }, use) => {
    const uniqueId = crypto.randomUUID();
    const userEmail = `e2e-user-${uniqueId}@example.com`;
    const userPassword = "Password123!";
    const userName = `E2E User ${uniqueId}`;

    let userId = "";

    try {
      // 1. Create user via Better Auth sign-up API
      await page.request.post("/api/auth/sign-up/email", {
        data: {
          email: userEmail,
          password: userPassword,
          name: userName,
        },
        headers: { Origin: "http://localhost:3000" },
      });

      // 2. Verify email via test API (replaces direct DB access)
      const verifyRes = await page.request.post("/api/e2e", {
        data: {
          action: "verify-email",
          email: userEmail,
        },
        headers: { "x-e2e-secret": E2E_SECRET },
      });
      const verifyData = await verifyRes.json();
      if (verifyData.userId) {
        userId = verifyData.userId;
      }

      // 3. Sign in via Better Auth API (shares cookies with page)
      await page.request.post("/api/auth/sign-in/email", {
        data: {
          email: userEmail,
          password: userPassword,
        },
        headers: { Origin: "http://localhost:3000" },
      });

      // 4. Provide fixture value to test
      await use({
        id: userId,
        email: userEmail,
        name: userName,
      });
    } finally {
      // 5. Cleanup: delete test user via test API
      await page.request.post("/api/e2e", {
        data: {
          action: "delete-user",
          userId,
          email: userEmail,
        },
        headers: { "x-e2e-secret": E2E_SECRET },
      });
    }
  },
});

export { expect } from "@playwright/test";
