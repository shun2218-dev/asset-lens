import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { expect, test } from "./fixtures";

test.describe("Account Deletion", () => {
  test("should allow user to delete their account", async ({
    page,
    authUser,
  }) => {
    // 1. Auth Setup handled by fixture

    // 2. Navigate to Settings page
    await page.goto("/settings");

    // Verify we are on the settings page (authenticated)
    await expect(page).toHaveURL(/\/settings/);

    // 3. Scroll to Danger Zone and click Delete Account
    const deleteButton = page.getByRole("button", {
      name: "アカウントを削除する",
    });

    // Ensure button is visible
    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click();

    // 4. Confirm deletion in the dialog
    await expect(page.getByRole("alertdialog")).toBeVisible();

    const confirmButton = page.getByRole("button", { name: "削除する" });
    await confirmButton.click();

    // 5. Verify redirection to landing page or login (e.g. '/')
    // Depends on app behavior after logout/deletion. Usually goes to /.
    await expect(page).not.toHaveURL(/\/settings/);

    // 6. Verify user is deleted from DB
    // Brief wait for DB sync
    await page.waitForTimeout(1000);

    const userInDb = await db.query.user.findFirst({
      where: eq(schema.user.email, authUser.email),
    });
    expect(userInDb).toBeUndefined();
  });
});
