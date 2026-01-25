import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { expect, test } from "./fixtures";

test.describe("Profile Update", () => {
  test("should allow user to update their profile name", async ({
    page,
    authUser,
  }) => {
    // 1. Auth Setup is handled by authUser fixture

    // 2. Navigate to Dashboard (Fixture logs in, but doesn't guarantee page navigation, so we go there)
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // 3. Navigate to Profile
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);

    // 4. Update Name
    const newName = "Updated E2E User";
    await page.getByLabel("名前").fill(newName);
    // The previous test logic used .getByRole('button', { name: '更新する' })
    await page.getByRole("button", { name: "更新する" }).click();

    // 5. Verify Toast and UI
    await expect(page.getByText("プロフィールを更新しました")).toBeVisible();
    await expect(page.getByLabel("名前")).toHaveValue(newName);

    // 6. DB Verification
    const userInDb = await db.query.user.findFirst({
      where: eq(schema.user.email, authUser.email),
    });
    expect(userInDb?.name).toBe(newName);
  });
});
