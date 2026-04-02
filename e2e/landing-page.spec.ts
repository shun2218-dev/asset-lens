import { expect, test } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero section with heading and CTA", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // Hero heading
    await expect(
      page.getByRole("heading", { level: 1, name: /資産管理を/ }),
    ).toBeVisible();

    // CTA button (may appear in hero + bottom CTA section, use first)
    await expect(
      page
        .getByRole("link", { name: /無料で始める|ダッシュボードを開く/ })
        .first(),
    ).toBeVisible();
  });

  test("renders 'How it works' section with 3 steps", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /3ステップで始められます/ }),
    ).toBeVisible();

    // Use heading role to avoid matching description text containing the same words
    await expect(
      page.getByRole("heading", { name: "アカウント作成" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "取引を記録" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "分析・改善" }),
    ).toBeVisible();
  });

  test("renders 6 feature cards", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /必要な機能を/ }),
    ).toBeVisible();

    const featureNames = [
      "直感的なグラフ",
      "パスキー認証",
      "シンプル設計",
      "予算管理",
      "セキュリティ",
      "サブスク管理",
    ];
    for (const name of featureNames) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
  });

  test("renders social proof and CTA sections", async ({ page }) => {
    await page.goto("/");

    // Social proof
    await expect(page.getByText("100%")).toBeVisible();
    await expect(page.getByText("無料で利用可能")).toBeVisible();

    // Bottom CTA
    await expect(
      page.getByRole("heading", { name: /今日から家計管理を始めましょう/ }),
    ).toBeVisible();
  });

  test("'機能を見る' link scrolls to features section", async ({ page }) => {
    await page.goto("/");

    const featuresLink = page.getByRole("link", { name: "機能を見る" });
    await expect(featuresLink).toBeVisible();
    await expect(featuresLink).toHaveAttribute("href", "#features");
  });
});
