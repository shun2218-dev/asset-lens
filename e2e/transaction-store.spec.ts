import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { expect, test } from "./fixtures";

test.describe("Transaction with Store Name", () => {
  test("should save storeName when selecting existing store", async ({
    page,
    authUser,
  }) => {
    // Pre-create a store in DB
    await db.insert(schema.store).values({
      userId: authUser.id,
      name: "既存テスト店舗",
    });

    // Navigate to Transaction page (form is here, not /dashboard)
    await page.goto("/transaction");
    await expect(page).toHaveURL(/\/transaction/);

    // Wait for form to load
    await page
      .getByLabel("金額")
      .first()
      .waitFor({ state: "visible", timeout: 15000 });

    // Fill form — scope combobox to 通常入力 tab panel
    await page.getByLabel("金額").first().fill("980");
    const formPanel = page.getByLabel("通常入力");
    await formPanel.getByRole("combobox").click();
    await page.getByRole("option", { name: "食費" }).click();

    // Open store select and choose existing store
    await page.getByRole("button", { name: /店舗・サービス名を選択/ }).click();
    await page.waitForTimeout(500);
    const popover = page.locator("[data-slot='popover-content']");
    await popover
      .locator("button")
      .filter({ hasText: "既存テスト店舗" })
      .click();
    await page.waitForTimeout(500);

    // Verify selection
    await expect(
      formPanel.getByRole("button", { name: /既存テスト店舗/ }),
    ).toBeVisible({ timeout: 5000 });

    // Submit
    await page.getByLabel("用途・メモ").fill("E2E Existing Store Test");
    await page.getByRole("button", { name: "登録する" }).click();
    await expect(page.getByText("登録しました")).toBeVisible({
      timeout: 10000,
    });
    await page.waitForTimeout(1000);

    // DB Verification
    const tx = await db.query.transaction.findFirst({
      where: eq(schema.transaction.description, "E2E Existing Store Test"),
    });
    expect(tx).toBeDefined();
    expect(tx?.storeName).toBe("既存テスト店舗");

    // Check row appears in transaction list
    await expect(
      page.locator("tr").filter({ hasText: "E2E Existing Store Test" }),
    ).toBeVisible({ timeout: 10000 });

    // Cleanup
    await db
      .delete(schema.transaction)
      .where(eq(schema.transaction.userId, authUser.id));
    await db.delete(schema.store).where(eq(schema.store.userId, authUser.id));
  });

  test("should show all transactions across pages with stable pagination", async ({
    page,
    authUser,
  }) => {
    // Get food category
    const categories = await db.query.category.findMany();
    const foodCat = categories.find((c) => c.slug === "food");
    expect(foodCat).toBeDefined();

    // Clean up ALL existing transactions for this user first
    await db
      .delete(schema.transaction)
      .where(eq(schema.transaction.userId, authUser.id));

    // Insert exactly 15 transactions (2 pages: 10 + 5)
    const testMonth = "2099-06";
    const sameDate = new Date(Date.UTC(2099, 5, 15));
    const values = Array.from({ length: 15 }, (_, i) => ({
      userId: authUser.id,
      amount: (i + 1) * 100,
      description: `E2E-Page-${String(i + 1).padStart(3, "0")}`,
      storeName: (i + 1) % 3 === 0 ? `Store-${i + 1}` : null,
      category: "food",
      categoryId: foodCat!.id,
      date: sameDate,
      isExpense: true,
    }));
    await db.insert(schema.transaction).values(values);

    // Navigate to transaction page
    await page.goto(`/transaction?month=${testMonth}`);
    await page.waitForLoadState("networkidle");

    // Page 1: collect E2E-Page descriptions
    await page.waitForTimeout(500);
    const allDescriptions: string[] = [];

    let rows = await page.locator("tr").filter({ hasText: "E2E-Page" }).all();
    expect(rows.length).toBe(10);
    for (const row of rows) {
      const text = await row.textContent();
      const match = text?.match(/E2E-Page-\d+/);
      if (match) allDescriptions.push(match[0]);
    }

    // Page 2: click Next button (not link — PaginationControl uses Button)
    const nextBtn = page.getByRole("button", { name: "Go to next page" });
    await nextBtn.click();
    await page.waitForTimeout(1000);

    rows = await page.locator("tr").filter({ hasText: "E2E-Page" }).all();
    expect(rows.length).toBe(5);
    for (const row of rows) {
      const text = await row.textContent();
      const match = text?.match(/E2E-Page-\d+/);
      if (match) allDescriptions.push(match[0]);
    }

    // Verify all 15 unique records appeared (no duplicates, no missing)
    expect([...new Set(allDescriptions)].length).toBe(15);

    // Cleanup
    await db
      .delete(schema.transaction)
      .where(eq(schema.transaction.userId, authUser.id));
  });
});
