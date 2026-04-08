import { expect, test } from "./fixtures";

test.describe("Dashboard Widgets & Navigation", () => {
  test("should render main dashboard widgets", async ({ page, authUser }) => {
    void authUser;

    // Create a transaction first so widgets have data to render
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "記録する" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("金額").fill("500");
    await dialog.getByRole("combobox").click();
    await page.getByRole("option", { name: "食費" }).click();
    await dialog.getByLabel("用途・メモ").fill("Dashboard E2E Test");

    // Submit
    await dialog
      .getByRole("button", { name: "登録する" })
      .click({ force: true });
    // Wait for the form to close and toast to appear
    await expect(page.getByText("登録しました")).toBeVisible();

    // Wait a bit for widgets to refresh
    await page.waitForTimeout(1000);

    // Verify heatmap renders
    await expect(page.getByText(/支出ヒートマップ/)).toBeVisible();
  });

  test("should allow navigating months via buttons", async ({
    page,
    authUser,
  }) => {
    void authUser;

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Click previous month button
    const prevButton = page.getByRole("button", { name: /先月/ });
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await expect(page).toHaveURL(/month=/);
    }
  });

  test("should display onboarding tour when local storage is empty", async ({
    page,
    authUser,
  }) => {
    void authUser;

    // For this test, we need to bypass the fixture's addInitScript that sets the flag.
    await page.goto("/dashboard");
    await page.evaluate(() => {
      window.sessionStorage.setItem("e2e-show-tour", "true");
      window.localStorage.removeItem("assetlens-tour-completed");
    });

    // Reload so the component runs its useEffect check against the empty LS
    await page.reload();

    // Tour modal should be visible
    await expect(page.getByText("スワイプで月を切り替え")).toBeVisible({
      timeout: 10000,
    });

    // Click 'skip'
    await page.getByRole("button", { name: "スキップ", exact: true }).click();

    // Should be hidden
    await expect(page.getByText("スワイプで月を切り替え")).not.toBeVisible();

    // Reload page, should NOT show because completing/skipping sets the flag
    await page.reload();
    await expect(page.getByText("スワイプで月を切り替え")).not.toBeVisible();
  });
});
