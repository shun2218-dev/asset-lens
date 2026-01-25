import { test, expect } from '@playwright/test';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

test.describe('Account Deletion', () => {
  const userEmail = `e2e-test-${crypto.randomUUID()}@example.com`;
  const userPassword = 'Password123!';
  const userName = 'E2E Test User';

  test('should allow user to delete their account', async ({ page, request }) => {
    // 1. Sign Up via API
    const signUpRes = await page.request.post('/api/auth/sign-up/email', {
      data: {
        email: userEmail,
        password: userPassword,
        name: userName,
      },
      headers: {
        'Origin': 'http://localhost:3000',
      },
    });
    expect(signUpRes.ok()).toBeTruthy();

    // 2. Verify Email in DB (manually)
    // Wait a bit for DB to propagate if needed (usually instant)
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, userEmail),
    });
    expect(user).toBeDefined();

    if (user) {
        await db.update(schema.user)
            .set({ emailVerified: true })
            .where(eq(schema.user.id, user.id));
    }

    // 3. Sign In via API to get session cookie
    const signInRes = await page.request.post('/api/auth/sign-in/email', {
        data: {
            email: userEmail,
            password: userPassword,
        },
        headers: {
            'Origin': 'http://localhost:3000',
        },
    });
    expect(signInRes.ok()).toBeTruthy();

    // 4. Navigate to Settings page
    await page.goto('/settings');

    // Verify we are on the settings page (authenticated)
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText(userName)).toBeVisible();

    // 5. Scroll to Danger Zone and click Delete Account
    const deleteButton = page.getByRole('button', { name: 'アカウントを削除する' });
    
    // Ensure button is visible
    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click();

    // 6. Confirm deletion in the dialog
    await expect(page.getByRole('alertdialog')).toBeVisible();
    
    const confirmButton = page.getByRole('button', { name: '削除する' });
    await confirmButton.click();

    // 7. Verify redirection to landing page or login
    await expect(page).not.toHaveURL(/\/settings/);
    
    // 8. Verify user is deleted from DB
    const userInDb = await db.query.user.findFirst({
        where: eq(schema.user.email, userEmail),
    });
    expect(userInDb).toBeUndefined();
  });

  test.afterEach(async () => {
    // Cleanup in case test failed/stopped early
    try {
        const user = await db.query.user.findFirst({
            where: eq(schema.user.email, userEmail),
        });
        if (user) {
            await db.delete(schema.user).where(eq(schema.user.id, user.id));
        }
    } catch (e) {
        // Ignore
    }
  });
});
