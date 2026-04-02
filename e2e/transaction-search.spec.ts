import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { expect, test } from "./fixtures";

/**
 * Seed transactions directly in DB for reliable E2E testing.
 * Avoids depending on the form UI which may change.
 */
async function seedTransactions(
  userId: string,
  items: { amount: number; description: string; storeName?: string }[],
) {
  for (const item of items) {
    await db.insert(schema.transaction).values({
      userId,
      amount: item.amount,
      description: item.description,
      storeName: item.storeName ?? null,
      category: "food",
      isExpense: true,
      date: new Date(),
    });
  }
}

/**
 * Clean up test transactions for a user.
 */
async function cleanupTransactions(userId: string) {
  await db
    .delete(schema.transaction)
    .where(eq(schema.transaction.userId, userId));
}

test.describe("Transaction Search", () => {
  test.setTimeout(60_000);

  test("should filter transactions by search query", async ({
    page,
    authUser,
  }) => {
    // 1. Seed test data directly in DB
    await seedTransactions(authUser.id, [
      { amount: 250, description: "E2E検索テスト牛乳" },
      { amount: 800, description: "E2E検索テストランチ" },
      { amount: 500, description: "E2E検索テスト電車代" },
    ]);

    // 2. Navigate to transaction page
    await page.goto("/transaction");
    await expect(page).toHaveURL(/\/transaction/);

    // Verify all 3 are visible
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト牛乳" }),
    ).toBeVisible();
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テストランチ" }),
    ).toBeVisible();
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト電車代" }),
    ).toBeVisible();

    // 3. Search for "牛乳"
    const searchInput = page.getByPlaceholder("内容・店舗名で検索...");
    await searchInput.fill("牛乳");
    await page.waitForTimeout(1500);

    // 4. Only matching transaction visible
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト牛乳" }),
    ).toBeVisible();
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テストランチ" }),
    ).not.toBeVisible();
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト電車代" }),
    ).not.toBeVisible();

    // 5. Clear search — all reappear
    await searchInput.clear();
    await page.waitForTimeout(1500);

    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト牛乳" }),
    ).toBeVisible();
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テストランチ" }),
    ).toBeVisible();
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト電車代" }),
    ).toBeVisible();

    // Cleanup
    await cleanupTransactions(authUser.id);
  });

  test("should combine date filter with search without losing results", async ({
    page,
    authUser,
  }) => {
    // This test covers the exact reported bug:
    // date filter + search caused results to disappear.

    await seedTransactions(authUser.id, [
      { amount: 350, description: "E2E日付検索テスト牛乳" },
      { amount: 600, description: "E2E日付検索テストパン" },
    ]);

    await page.goto("/transaction");
    await expect(page).toHaveURL(/\/transaction/);

    // Verify both visible
    await expect(
      page.locator("tr").filter({ hasText: "E2E日付検索テスト牛乳" }),
    ).toBeVisible();
    await expect(
      page.locator("tr").filter({ hasText: "E2E日付検索テストパン" }),
    ).toBeVisible();

    // Apply date filter: click 開始日
    await page.getByRole("button", { name: "開始日" }).click();
    await page.waitForTimeout(300);
    // Select day 1 — use the named calendar grid
    await page
      .getByRole("grid", { name: /April 2026/ })
      .getByRole("button", { name: /April 1st/ })
      .click();
    await page.waitForTimeout(1000);

    // Verify still visible after date filter
    await expect(
      page.locator("tr").filter({ hasText: "E2E日付検索テスト牛乳" }),
    ).toBeVisible();

    // Search for "牛乳" WITH date filter active
    const searchInput = page.getByPlaceholder("内容・店舗名で検索...");
    await searchInput.fill("牛乳");
    await page.waitForTimeout(1500);

    // THE CRITICAL ASSERTION:
    await expect(
      page.locator("tr").filter({ hasText: "E2E日付検索テスト牛乳" }),
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator("tr").filter({ hasText: "E2E日付検索テストパン" }),
    ).not.toBeVisible();

    await cleanupTransactions(authUser.id);
  });

  test("should show empty state when search has no results", async ({
    page,
    authUser,
  }) => {
    await page.goto("/transaction");
    await expect(page).toHaveURL(/\/transaction/);

    const searchInput = page.getByPlaceholder("内容・店舗名で検索...");
    await searchInput.fill("存在しないテストデータ99999");
    await page.waitForTimeout(1500);

    await expect(page.getByText(/一致する取引が見つかりません/)).toBeVisible();
  });

  test("should persist search query in URL and reset", async ({
    page,
    authUser,
  }) => {
    await seedTransactions(authUser.id, [
      { amount: 100, description: "E2EURL永続化テスト" },
    ]);

    await page.goto("/transaction");
    await expect(page).toHaveURL(/\/transaction/);

    const searchInput = page.getByPlaceholder("内容・店舗名で検索...");
    await searchInput.fill("URL永続化");
    await page.waitForTimeout(1500);

    // URL has q parameter
    expect(page.url()).toContain("q=");

    // Reset
    await page.getByRole("button", { name: /リセット/ }).click();
    await page.waitForTimeout(500);

    // q removed
    expect(page.url()).not.toContain("q=");

    await cleanupTransactions(authUser.id);
  });

  test("should search by store name", async ({ page, authUser }) => {
    await seedTransactions(authUser.id, [
      { amount: 200, description: "お買い物", storeName: "セブンイレブン" },
      { amount: 300, description: "お買い物", storeName: "ローソン" },
    ]);

    await page.goto("/transaction");
    await expect(page).toHaveURL(/\/transaction/);

    const searchInput = page.getByPlaceholder("内容・店舗名で検索...");
    await searchInput.fill("セブン");
    await page.waitForTimeout(1500);

    // Only the セブンイレブン transaction should be visible
    await expect(
      page.locator("tr").filter({ hasText: "セブンイレブン" }),
    ).toBeVisible();
    await expect(
      page.locator("tr").filter({ hasText: "ローソン" }),
    ).not.toBeVisible();

    await cleanupTransactions(authUser.id);
  });
});
