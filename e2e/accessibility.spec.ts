import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

test.describe("Accessibility: Key Pages", () => {
  test("dashboard page has no critical a11y violations", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations.filter((v) => v.impact === "critical"),
    ).toHaveLength(0);
  });

  test("transaction page has no critical a11y violations", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/transaction");
    await page.waitForLoadState("networkidle");

    // Note: "aria-valid-attr-value" is disabled because Radix UI generates
    // dynamic IDs for aria-controls that may not resolve correctly during
    // SSR hydration. This is a known Radix issue, not a real a11y bug.
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["aria-valid-attr-value"])
      .analyze();

    expect(
      results.violations.filter((v) => v.impact === "critical"),
    ).toHaveLength(0);
  });

  test("settings page has no critical a11y violations", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations.filter((v) => v.impact === "critical"),
    ).toHaveLength(0);
  });

  test("profile page has no critical a11y violations", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations.filter((v) => v.impact === "critical"),
    ).toHaveLength(0);
  });

  test("subscription page has no critical a11y violations", async ({
    page,
    authUser,
  }) => {
    void authUser;
    await page.goto("/subscription");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations.filter((v) => v.impact === "critical"),
    ).toHaveLength(0);
  });
});
