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
      // 1. Create test user
      const signUpRes = await page.request.post("/api/auth/sign-up/email", {
        data: {
          email: userEmail,
          password: userPassword,
          name: userName,
        },
        headers: { Origin: "http://localhost:3000" },
      });
      if (!signUpRes.ok())
        console.log("SignUp failed:", await signUpRes.text());

      // 2. Verify email
      const verifyRes = await page.request.post("/api/e2e", {
        data: {
          action: "verify-email",
          email: userEmail,
        },
        headers: { "x-e2e-secret": E2E_SECRET },
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok()) console.log("Verify failed:", verifyData);

      if (verifyData.userId) {
        userId = verifyData.userId;
      }

      // 3. Sign in
      const signInRes = await page.request.post("/api/auth/sign-in/email", {
        data: {
          email: userEmail,
          password: userPassword,
        },
        headers: { Origin: "http://localhost:3000" },
      });
      if (!signInRes.ok())
        console.log("SignIn failed:", await signInRes.text());

      // 3.5. Suppress onboarding tour for stability
      await page.addInitScript(() => {
        if (!window.sessionStorage.getItem("e2e-show-tour")) {
          window.localStorage.setItem("assetlens-tour-completed", "true");
        }
      });

      // 4. Yield fixture
      await use({
        id: userId,
        email: userEmail,
        name: userName,
      });
    } finally {
      // 5. Cleanup
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
