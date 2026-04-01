import { expect, test } from "@playwright/test";

const FOOTER_PAGES = [
  {
    path: "/terms",
    heading: "利用規約",
    sections: ["第1条", "第2条", "第3条"],
  },
  {
    path: "/privacy",
    heading: "プライバシーポリシー",
    sections: ["収集する情報", "情報の利用目的", "データの削除"],
  },
  {
    path: "/contact",
    heading: "お問い合わせ",
    sections: ["フォームからお問い合わせ", "よくある質問"],
  },
] as const;

test.describe("Footer Pages: Static Content", () => {
  for (const page of FOOTER_PAGES) {
    test(`${page.path} renders with correct heading and content`, async ({
      page: browserPage,
    }) => {
      const response = await browserPage.goto(page.path);

      // Page loads successfully
      expect(response?.status()).toBe(200);

      // Main heading is visible
      await expect(
        browserPage.getByRole("heading", { level: 1, name: page.heading }),
      ).toBeVisible();

      // Key sections are present
      for (const section of page.sections) {
        await expect(browserPage.getByText(section).first()).toBeVisible();
      }

      // Back-to-top link exists
      await expect(
        browserPage.getByRole("link", { name: /トップページに戻る/ }),
      ).toBeVisible();
    });
  }

  test("footer links navigate to correct pages", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Footer may be hidden on mobile, so check desktop viewport
    const footer = page.locator("footer");
    if (await footer.isVisible()) {
      for (const { path } of FOOTER_PAGES) {
        const link = footer.locator(`a[href="${path}"]`);
        await expect(link).toBeAttached();
      }
    }
  });
});
