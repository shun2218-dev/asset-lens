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

    // Select "全体予算" (default) and set amount
    await page.getByPlaceholder("金額").fill("200000");
    await page.getByRole("button", { name: "追加" }).click();

    // Verify the budget amount appears
    await expect(page.getByText("¥200,000")).toBeVisible();
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

    // Select category from the budget select
    await page
      .getByRole("combobox", { name: "Select budget category" })
      .click();
    await page.getByRole("option", { name: "食費" }).click();

    // Set amount
    await page.getByPlaceholder("金額").fill("50000");
    await page.getByRole("button", { name: "追加" }).click();

    // Verify category budget appears
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
    await page.getByPlaceholder("金額").fill("200000");
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByText("¥200,000")).toBeVisible();

    // Create a transaction via /transaction page
    await page.goto("/transaction");
    await page
      .getByLabel("金額")
      .first()
      .waitFor({ state: "visible", timeout: 15000 });
    await page.getByLabel("金額").first().fill("10000");
    const formPanel = page.getByLabel("通常入力");
    await formPanel.getByRole("combobox").click();
    await page.getByRole("option", { name: "食費" }).click();
    await page.getByLabel("用途・メモ").fill("Budget Test Expense");
    await page.getByRole("button", { name: "登録する" }).click();
    await expect(page.getByText("登録しました")).toBeVisible();

    // Navigate to dashboard to check budget widget
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify budget progress section appears (heading: "📊 予算進捗")
    await expect(page.getByText("予算進捗")).toBeVisible({ timeout: 10000 });
  });

  test("should edit budget entry", async ({ page, authUser }) => {
    void authUser;
    // Set initial budget
    await page.goto("/settings");
    await page.getByRole("tab", { name: "予算" }).click();
    await page.getByPlaceholder("金額").fill("200000");
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByText("¥200,000")).toBeVisible();

    // Edit the budget (click pencil icon)
    await page.getByRole("button", { name: "Edit budget" }).click();

    // Change the amount
    await page.locator("input[type='number']").first().fill("300000");
    await page.getByRole("button", { name: "保存" }).click();

    // Verify update
    await expect(page.getByText("¥300,000")).toBeVisible();
  });

  test("should delete budget entry", async ({ page, authUser }) => {
    void authUser;
    // Set initial budget
    await page.goto("/settings");
    await page.getByRole("tab", { name: "予算" }).click();
    await page.getByPlaceholder("金額").fill("200000");
    await page.getByRole("button", { name: "追加" }).click();
    await expect(page.getByText("¥200,000")).toBeVisible();

    // Delete the budget (click trash icon)
    await page.getByRole("button", { name: "Delete budget" }).click();

    // Confirm delete
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "削除する" }).click();

    // Verify deletion — budget amount should disappear
    await expect(page.getByText("¥200,000")).not.toBeVisible();
    await expect(page.getByText("未設定")).toBeVisible();
  });
});

test.describe("Quick Entry Dialog", () => {
  test("should open quick entry, fill form, and submit transaction", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/dashboard/);

    // Open quick entry via header button ("記録する")
    await page.getByRole("button", { name: "記録する" }).click();

    // Verify dialog opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Fill the form inside the dialog (scoped — no combobox conflict)
    await dialog.getByLabel("金額").fill("500");
    await dialog.getByRole("combobox").click();
    await page.getByRole("option", { name: "食費" }).click();
    await dialog.getByLabel("用途・メモ").fill("Quick Entry Test");

    // Submit
    await dialog.getByRole("button", { name: "登録する" }).click();

    // Verify success
    await expect(page.getByText("登録しました")).toBeVisible();
  });
});
