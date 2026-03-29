import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { expect, test } from "./fixtures";

test.describe("Transaction with Store Name", () => {
  test("should save storeName when selecting existing store", async ({
    page,
    authUser,
  }) => {
    // 1. Pre-create a store in DB
    await db.insert(schema.store).values({
      userId: authUser.id,
      name: "既存テスト店舗",
    });

    // 2. Navigate to Dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // 3. Fill form
    await page.getByLabel("金額").fill("980");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "食費" }).click();

    // Store: click the trigger button to open popover
    const storeButton = page.getByRole("button", {
      name: /店舗・サービス名を選択/,
    });
    await storeButton.click();

    // Wait for the popover to open
    await page.waitForTimeout(500);

    // Click the existing store option in the popover dropdown
    // Use a more specific selector - the popover content items
    const popoverContent = page.locator("[data-slot='popover-content']");
    const storeOption = popoverContent.locator("button").filter({
      hasText: "既存テスト店舗",
    });
    await expect(storeOption).toBeVisible({ timeout: 5000 });
    await storeOption.click();

    // Wait for popover to close
    await page.waitForTimeout(500);

    // Verify the trigger button now shows the selected store name
    const triggerButton = page.getByLabel("通常入力").getByRole("button", {
      name: /既存テスト店舗/,
    });
    await expect(triggerButton).toBeVisible({ timeout: 5000 });

    // Description
    await page.getByLabel("用途・メモ").fill("E2E Existing Store Test");

    // Submit
    await page.getByRole("button", { name: "登録する" }).click();
    await expect(page.getByText("登録しました")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // 4. DB Verification
    const tx = await db.query.transaction.findFirst({
      where: eq(schema.transaction.description, "E2E Existing Store Test"),
    });
    expect(tx).toBeDefined();
    expect(tx?.amount).toBe(980);
    expect(tx?.storeName).toBe("既存テスト店舗");

    // 5. Check row appears in dashboard
    const row = page.locator("tr").filter({ hasText: "E2E Existing Store Test" });
    await expect(row).toBeVisible({ timeout: 10000 });

    // 6. Navigate to transaction page - verify default list
    await page.goto("/transaction");
    await page.waitForLoadState("networkidle");

    const txRow = page.locator("tr").filter({ hasText: "E2E Existing Store Test" });
    await expect(txRow).toBeVisible({ timeout: 10000 });

    // 7. Cleanup
    await db
      .delete(schema.transaction)
      .where(eq(schema.transaction.userId, authUser.id));
    await db
      .delete(schema.store)
      .where(eq(schema.store.userId, authUser.id));
  });
});
