import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { expect, test } from "./fixtures";

test.describe("Transaction", () => {
  test("should allow user to create a new transaction", async ({
    page,
    authUser,
  }) => {
    // Navigate to Transaction page (form is here, not on dashboard)
    await page.goto("/transaction");
    await expect(page).toHaveURL(/\/transaction/);

    // Wait for form to load
    await page
      .getByLabel("金額")
      .first()
      .waitFor({ state: "visible", timeout: 15000 });

    // Fill Transaction Form — scope combobox to the "通常入力" tab panel
    const amountInput = page.getByLabel("金額").first();
    await amountInput.click();
    await amountInput.fill("1200");
    await amountInput.blur();
    await expect(amountInput).toHaveValue("1200", { timeout: 5000 });

    // Category (the form has combobox, but filter section also has one — use first)
    const formPanel = page.getByLabel("通常入力");
    await formPanel.getByRole("combobox").click();
    await page.getByRole("option", { name: "食費" }).click();

    // Description
    const descInput = page.getByLabel("用途・メモ");
    await descInput.clear();
    await descInput.fill("E2E Test Lunch");
    await descInput.blur();

    // Submit
    const submitBtn = page.getByRole("button", { name: "登録する" });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click({ position: { x: 5, y: 5 } });

    // Success toast
    await expect(page.getByText("登録しました")).toBeVisible({
      timeout: 10000,
    });

    // Check row
    const transactionRow = page
      .locator("tr")
      .filter({ hasText: "E2E Test Lunch" });

    await expect(transactionRow).toBeVisible();
    await expect(transactionRow).toContainText("1,200");

    // DB Verification
    const tx = await db.query.transaction.findFirst({
      where: eq(schema.transaction.description, "E2E Test Lunch"),
    });
    expect(tx).toBeDefined();
    expect(tx?.amount).toBe(1200);

    // Edit Transaction
    await transactionRow
      .getByRole("button", { name: "メニューを開く" })
      .click();
    await page.getByRole("menuitem", { name: "編集" }).click();

    // Verify Dialog
    const editDialog = page.getByRole("dialog", { name: "履歴の編集" });
    await expect(editDialog).toBeVisible();
    const editAmount = editDialog.getByLabel("金額");
    await editAmount.clear();
    await editAmount.fill("1500");
    await editAmount.blur();
    const editDesc = editDialog.getByLabel("用途・メモ");
    await editDesc.clear();
    await editDesc.fill("E2E Test Lunch Updated");
    await editDesc.blur();
    await editDialog
      .getByRole("button", { name: "更新する" })
      .click({ position: { x: 5, y: 5 } });

    // Verify Success
    await expect(page.getByText("更新しました")).toBeVisible();

    // Check updated values
    const updatedRow = page
      .locator("tr")
      .filter({ hasText: "E2E Test Lunch Updated" });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText("1,500");

    // Hide Sonner toasts to prevent pointer event interception on mobile viewports
    await page.addStyleTag({
      content: "[data-sonner-toaster] { display: none !important; }",
    });
    await updatedRow.getByRole("button", { name: "メニューを開く" }).click();
    await page.getByRole("menuitem", { name: "削除" }).click();

    // Confirm Delete
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "削除する" }).click();

    // Verify Success
    await expect(updatedRow).not.toBeVisible();

    // Brief wait for DB consistency
    await page.waitForTimeout(1000);

    await expect
      .poll(
        async () => {
          return await db.query.transaction.findFirst({
            where: and(
              eq(schema.transaction.description, "E2E Test Lunch Updated"),
              eq(schema.transaction.userId, authUser.id),
            ),
          });
        },
        { timeout: 10000 },
      )
      .toBeUndefined();
  });
});
