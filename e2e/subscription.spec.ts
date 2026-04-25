import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { expect, test } from "./fixtures";

test.describe("Subscription", () => {
  test("should allow user to create and view a subscription", async ({
    page,
    authUser,
  }) => {
    // 1. Auth Setup handled by fixture

    // 2. Navigate to Settings -> Subscription Tab
    await page.goto("/settings");
    const subTab = page.getByRole("tab", { name: "サブスク" });
    await subTab.click();
    const subTabVisible = await page
      .getByLabel("サービス名")
      .isVisible()
      .catch(() => false);
    if (!subTabVisible) {
      await subTab.press("Enter");
    }
    await expect(page.getByLabel("サービス名")).toBeVisible({ timeout: 10000 });

    // 3. Fill Subscription Form
    await page.getByLabel("サービス名").fill("E2E Streaming Service");
    const amountInput = page.getByLabel("金額 (円)");
    await amountInput.fill("980");
    await amountInput.blur();

    // Cycle defaults to Monthly

    // Date
    await page.getByText("日付を選択").click();
    // Pick the 15th
    await page
      .locator('[data-slot="calendar"] button[data-day]')
      .first()
      .click({ force: true });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300); // wait for popover animation to finish

    // Category is now fixed to "subscription" (no UI selection needed)

    // 4. Submit
    const submitBtn = page.getByRole("button", { name: "登録する" });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click({ position: { x: 5, y: 5 } });

    // 5. Verification
    await expect(
      page.getByText("サブスクリプションを追加しました"),
    ).toBeVisible({ timeout: 10000 });

    // Verify list item appearance
    await expect(page.getByText("E2E Streaming Service")).toBeVisible();
    await expect(page.getByText("980", { exact: false })).toBeVisible();

    // 6. DB Verification
    const sub = await db.query.subscription.findFirst({
      where: eq(schema.subscription.name, "E2E Streaming Service"),
    });
    expect(sub).toBeDefined();
    expect(sub?.amount).toBe(980);
    expect(sub?.category).toBe("subscription");
  });
});
