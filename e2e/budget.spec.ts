import { expect, test } from "./fixtures";

test.describe("Budget Management", () => {
  test("should set overall budget from settings page", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings/);

    // Navigate to budget tab (use evaluate click for webkit compatibility)
    const budgetTab = page.getByRole("tab", { name: "予算" });
    await budgetTab.click();
    // Fallback: if tab panel didn't render, press Enter on focused tab
    const panelVisible = await page
      .getByText("予算設定")
      .isVisible()
      .catch(() => false);
    if (!panelVisible) {
      await budgetTab.press("Enter");
    }
    await expect(page.getByText("予算設定")).toBeVisible({ timeout: 10000 });

    // Select "全体予算" (default) and set amount
    const amountField1 = page.getByPlaceholder("金額");
    await amountField1.click();
    await amountField1.fill("200000");
    await amountField1.blur();
    const addBtn1 = page.getByRole("button", { name: "追加" });
    await expect(addBtn1).toBeEnabled({ timeout: 10000 });
    await addBtn1.click();

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
    const budgetTabCat = page.getByRole("tab", { name: "予算" });
    await budgetTabCat.click();
    const catPanelVisible = await page
      .getByText("予算設定")
      .isVisible()
      .catch(() => false);
    if (!catPanelVisible) {
      await budgetTabCat.press("Enter");
    }
    await expect(page.getByText("予算設定")).toBeVisible({ timeout: 10000 });

    // Select category from the budget select
    await page.getByRole("combobox").last().click();
    await page.getByRole("option", { name: "食費" }).click();

    // Set amount
    const catAmountField = page.getByPlaceholder("金額");
    await catAmountField.click();
    await catAmountField.fill("50000");
    await catAmountField.blur();
    const catAddBtn = page.getByRole("button", { name: "追加" });
    await expect(catAddBtn).toBeEnabled({ timeout: 10000 });
    await catAddBtn.click();

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
    const budgetTab3 = page.getByRole("tab", { name: "予算" });
    await budgetTab3.click();
    const panelVisible3 = await page
      .getByText("予算設定")
      .isVisible()
      .catch(() => false);
    if (!panelVisible3) {
      await budgetTab3.press("Enter");
    }
    await expect(page.getByText("予算設定")).toBeVisible({ timeout: 10000 });
    const budgetAmountField = page.getByPlaceholder("金額").first();
    await budgetAmountField.click();
    await budgetAmountField.fill("200000");
    await budgetAmountField.blur();
    const addBtn = page.getByRole("button", { name: "追加" });
    await expect(addBtn).toBeEnabled({ timeout: 10000 });
    await addBtn.click({ position: { x: 5, y: 5 } });
    await expect(page.getByText("¥200,000")).toBeVisible({ timeout: 10000 });

    // Create a transaction via /transaction page
    await page.goto("/transaction");
    await page
      .getByLabel("金額")
      .first()
      .waitFor({ state: "visible", timeout: 15000 });
    const amountField = page.getByLabel("金額").first();
    await amountField.click();
    await amountField.fill("10000");
    await amountField.blur();
    // Verify the value was accepted by the input
    await expect(amountField).toHaveValue("10000", { timeout: 5000 });
    const formPanel = page.getByLabel("通常入力");
    await formPanel.getByRole("combobox").click();
    await page.getByRole("option", { name: "食費" }).click();
    const descInput = page.getByLabel("用途・メモ");
    await descInput.clear();
    await descInput.fill("Budget Test Expense");
    await descInput.blur();

    const submitBtn = page.getByRole("button", { name: "登録する" });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click({ position: { x: 5, y: 5 } });
    await expect(page.getByText("登録しました")).toBeVisible({
      timeout: 10000,
    });

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
    const budgetTab2 = page.getByRole("tab", { name: "予算" });
    await budgetTab2.click();
    const panelVisible2 = await page
      .getByText("予算設定")
      .isVisible()
      .catch(() => false);
    if (!panelVisible2) {
      await budgetTab2.press("Enter");
    }
    await expect(page.getByText("予算設定")).toBeVisible({ timeout: 10000 });
    const editAmountField = page.getByPlaceholder("金額");
    await editAmountField.click();
    await editAmountField.fill("200000");
    await editAmountField.blur();
    const editAddBtn = page.getByRole("button", { name: "追加" });
    await expect(editAddBtn).toBeEnabled({ timeout: 10000 });
    await editAddBtn.click();
    await expect(page.getByText("¥200,000")).toBeVisible({ timeout: 10000 });

    // Edit the budget (click pencil icon)
    await page.getByRole("button", { name: "Edit budget" }).click();

    // Change the amount
    const editInput = page.locator("input[type='number']").first();
    await editInput.clear();
    await editInput.fill("300000");
    await editInput.blur();
    await page.getByRole("button", { name: "保存" }).click();

    // Verify update
    await expect(page.getByText("¥300,000")).toBeVisible();
  });

  test("should delete budget entry", async ({ page, authUser }) => {
    void authUser;
    // Set initial budget
    await page.goto("/settings");
    const budgetTab4 = page.getByRole("tab", { name: "予算" });
    await budgetTab4.click();
    const panelVisible4 = await page
      .getByText("予算設定")
      .isVisible()
      .catch(() => false);
    if (!panelVisible4) {
      await budgetTab4.press("Enter");
    }
    await expect(page.getByText("予算設定")).toBeVisible({ timeout: 10000 });
    const editInput = page.locator('input[type="number"]').first();
    await editInput.click();
    await editInput.fill("200000");
    await editInput.blur();
    const delAddBtn = page.getByRole("button", { name: "追加" });
    await expect(delAddBtn).toBeEnabled({ timeout: 10000 });
    await delAddBtn.click();
    await expect(page.getByText("¥200,000")).toBeVisible({ timeout: 10000 });

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
    await page
      .getByRole("button", { name: "記録する" })
      .click({ position: { x: 5, y: 5 } });

    // Verify dialog opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Fill the form inside the dialog (scoped — no combobox conflict)
    const amountInput = dialog.getByLabel("金額");
    await amountInput.clear();
    await amountInput.fill("500");
    await amountInput.blur();
    await dialog.getByRole("combobox").click();
    await page.getByRole("option", { name: "食費" }).click();
    await dialog.getByLabel("用途・メモ").fill("Quick Entry Test");

    // Submit
    const quickSubmitBtn = dialog.getByRole("button", { name: "登録する" });
    await expect(quickSubmitBtn).toBeEnabled({ timeout: 10000 });
    await quickSubmitBtn.click({ position: { x: 5, y: 5 } });

    // Verify success
    await expect(page.getByText("登録しました")).toBeVisible({
      timeout: 10000,
    });
  });
});
