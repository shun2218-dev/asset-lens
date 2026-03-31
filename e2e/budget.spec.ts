import { expect, test } from "./fixtures";

test.describe("Budget Management", () => {
  test("should set overall budget from settings page", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);

    // Navigate to budget tab
    await page.getByRole("tab", { name: "予算" }).click();

    // Set overall budget
    await page.getByLabel("全体の月予算").fill("200000");
    await page.getByRole("button", { name: "設定する" }).first().click();

    // Verify success
    await expect(page.getByText("予算を設定しました")).toBeVisible();
  });

  test("should set per-category budget from settings page", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);

    // Navigate to budget tab
    await page.getByRole("tab", { name: "予算" }).click();

    // Add category budget
    await page.getByRole("button", { name: /カテゴリ別予算を追加/ }).click();

    // Select category
    await page.getByRole("combobox", { name: /カテゴリを選択/ }).click();
    await page.getByRole("option", { name: "食費" }).click();

    // Set amount
    await page.getByLabel("予算額").fill("50000");
    await page.getByRole("button", { name: "追加する" }).click();

    // Verify success
    await expect(page.getByText("予算を設定しました")).toBeVisible();
    await expect(page.getByText("食費")).toBeVisible();
    await expect(page.getByText("¥50,000")).toBeVisible();
  });

  test("should verify budget progress widget on dashboard", async ({
    page,
    authUser,
  }) => {
    void authUser;
    // First set a budget
    await page.goto("/settings");
    await page.getByRole("tab", { name: "予算" }).click();
    await page.getByLabel("全体の月予算").fill("200000");
    await page.getByRole("button", { name: "設定する" }).first().click();
    await expect(page.getByText("予算を設定しました")).toBeVisible();

    // Navigate to dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Add a transaction
    await page.getByLabel("金額").fill("10000");
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "食費" }).click();
    await page.getByLabel("用途・メモ").fill("Budget Test Expense");
    await page.getByRole("button", { name: "登録する" }).click();
    await expect(page.getByText("登録しました")).toBeVisible();

    // Verify budget progress section appears
    await expect(page.getByText("予算")).toBeVisible();
  });

  test("should edit budget entry", async ({ page, authUser }) => {
    void authUser;
    // Set initial budget
    await page.goto("/settings");
    await page.getByRole("tab", { name: "予算" }).click();
    await page.getByLabel("全体の月予算").fill("200000");
    await page.getByRole("button", { name: "設定する" }).first().click();
    await expect(page.getByText("予算を設定しました")).toBeVisible();

    // Edit the budget
    await page.getByRole("button", { name: /編集/ }).first().click();
    await page.getByLabel("全体の月予算").fill("300000");
    await page.getByRole("button", { name: "更新する" }).click();

    // Verify update
    await expect(page.getByText("予算を更新しました")).toBeVisible();
  });

  test("should delete budget entry", async ({ page, authUser }) => {
    void authUser;
    // Set initial budget
    await page.goto("/settings");
    await page.getByRole("tab", { name: "予算" }).click();
    await page.getByLabel("全体の月予算").fill("200000");
    await page.getByRole("button", { name: "設定する" }).first().click();
    await expect(page.getByText("予算を設定しました")).toBeVisible();

    // Delete the budget
    await page.getByRole("button", { name: /削除/ }).first().click();

    // Confirm delete
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "削除する" }).click();

    // Verify deletion
    await expect(page.getByText("予算を削除しました")).toBeVisible();
  });
});

test.describe("Quick Entry Dialog", () => {
  test("should open quick entry, fill form, and submit transaction", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Open quick entry with keyboard shortcut
    await page.keyboard.press("Meta+n");

    // Verify dialog opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Fill the form
    await dialog.getByLabel("金額").fill("500");
    await dialog.getByRole("combobox").click();
    await page.getByRole("option", { name: "食費" }).click();
    await dialog.getByLabel("用途・メモ").fill("Quick Entry Test");

    // Submit
    await dialog.getByRole("button", { name: "登録する" }).click();

    // Verify success
    await expect(page.getByText("登録しました")).toBeVisible();

    // Verify transaction appears in list
    const row = page.locator("tr").filter({ hasText: "Quick Entry Test" });
    await expect(row).toBeVisible();
    await expect(row).toContainText("500");
  });
});
