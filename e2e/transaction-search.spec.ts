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
  // Look up the "food" category ID
  const [foodCategory] = await db
    .select()
    .from(schema.category)
    .where(eq(schema.category.slug, "food"))
    .limit(1);

  const categoryId = foodCategory?.id;
  if (!categoryId) {
    throw new Error("food category not found in DB for e2e seeding");
  }

  for (const item of items) {
    await db.insert(schema.transaction).values({
      userId,
      amount: item.amount,
      description: item.description,
      storeName: item.storeName ?? null,
      categoryId,
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
    await page.waitForLoadState("networkidle");
    await page
      .getByPlaceholder("内容・店舗名・カテゴリで検索...")
      .waitFor({ state: "visible", timeout: 15000 });
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
    const searchInput = page.getByPlaceholder(
      "内容・店舗名・カテゴリで検索...",
    );
    await searchInput.fill("牛乳");

    // 4. Only matching transaction visible (wait for debounced filter)
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テストランチ" }),
    ).not.toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト電車代" }),
    ).not.toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト牛乳" }),
    ).toBeVisible();

    // 5. Clear search — all reappear
    await searchInput.fill("");

    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト牛乳" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テストランチ" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("tr").filter({ hasText: "E2E検索テスト電車代" }),
    ).toBeVisible({ timeout: 10000 });

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
    await page.getByRole("button", { name: "開始日" }).scrollIntoViewIfNeeded();
    await page
      .getByRole("button", { name: "開始日" })
      .evaluate((b) => (b as HTMLElement).click());

    // Explicitly wait for the calendar Popover to become visible in the DOM
    await page.waitForSelector('[data-slot="calendar"]', {
      state: "visible",
      timeout: 10000,
    });

    await page
      .locator('[data-slot="calendar"] button[data-day]')
      .first()
      .evaluate((b) => (b as HTMLElement).click());
    // Verify still visible after date filter
    await expect(
      page.locator("tr").filter({ hasText: "E2E日付検索テスト牛乳" }),
    ).toBeVisible({ timeout: 10000 });

    // Search for "牛乳" WITH date filter active
    const searchInput = page.getByPlaceholder(
      "内容・店舗名・カテゴリで検索...",
    );
    await searchInput.fill("牛乳");

    // THE CRITICAL ASSERTION: wait for filter debounce
    await expect(
      page.locator("tr").filter({ hasText: "E2E日付検索テストパン" }),
    ).not.toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("tr").filter({ hasText: "E2E日付検索テスト牛乳" }),
    ).toBeVisible();

    await cleanupTransactions(authUser.id);
  });

  test("should show empty state when search has no results", async ({
    page,
    authUser,
  }) => {
    await page.goto("/transaction");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/transaction/);

    const searchInput = page.getByPlaceholder(
      "内容・店舗名・カテゴリで検索...",
    );
    await searchInput.waitFor({ state: "visible", timeout: 15000 });
    await searchInput.fill("存在しないテストデータ99999");

    await expect(page.getByText(/一致する取引が見つかりません/)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should persist search query in URL and reset", async ({
    page,
    authUser,
  }) => {
    await seedTransactions(authUser.id, [
      { amount: 100, description: "E2EURL永続化テスト" },
    ]);

    await page.goto("/transaction");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/transaction/);

    const searchInput = page.getByPlaceholder(
      "内容・店舗名・カテゴリで検索...",
    );
    await searchInput.waitFor({ state: "visible", timeout: 15000 });
    await searchInput.fill("URL永続化");

    // URL has q parameter (wait for debounced router push)
    await expect(page).toHaveURL(/q=/, { timeout: 10000 });

    // Reset
    await page.getByRole("button", { name: /リセット/ }).click();

    // q removed (wait for router to update)
    await expect(page).not.toHaveURL(/q=/, { timeout: 10000 });

    await cleanupTransactions(authUser.id);
  });

  test("should search by store name", async ({ page, authUser }) => {
    await seedTransactions(authUser.id, [
      { amount: 200, description: "お買い物", storeName: "セブンイレブン" },
      { amount: 300, description: "お買い物", storeName: "ローソン" },
    ]);

    await page.goto("/transaction");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/transaction/);

    const searchInput = page.getByPlaceholder(
      "内容・店舗名・カテゴリで検索...",
    );
    await searchInput.waitFor({ state: "visible", timeout: 15000 });
    await searchInput.fill("セブン");

    // Only the セブンイレブン transaction should be visible (wait for debounce)
    await expect(
      page.locator("tr").filter({ hasText: "ローソン" }),
    ).not.toBeVisible({ timeout: 10000 });
    await expect(
      page.locator("tr").filter({ hasText: "セブンイレブン" }),
    ).toBeVisible();

    await cleanupTransactions(authUser.id);
  });
});
