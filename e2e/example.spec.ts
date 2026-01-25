import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // Note: Depending on the actual app title, this might need adjustment.
  // For now we check if the page loads and doesn't crash.
  // We can look for a common element like 'main' or specific text if we knew it.
  
  // Checking page title as a basic test.
  // Assuming the app name "Asset Lens" might be in the title or a header
  await expect(page).toHaveTitle(/AssetLens/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // As a generic test, let's just assert the URL is correct upon load
  await expect(page).toHaveURL('http://localhost:3000/');
});
