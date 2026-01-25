import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { test, expect } from '@playwright/test';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

test.describe('Transaction', () => {
  const userEmail = `e2e-tx-${crypto.randomUUID()}@example.com`;
  const userPassword = 'Password123!';
  const userName = 'E2E Tx User';

  test('should allow user to create a new transaction', async ({ page }) => {
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

    // 2. Verify Email in DB
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, userEmail),
    });
    expect(user).toBeDefined();

    if (user) {
        await db.update(schema.user)
            .set({ emailVerified: true })
            .where(eq(schema.user.id, user.id));
    }

    // 3. Sign In via API
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

    // 4. Navigate to Dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // 5. Fill Transaction Form
    // Amount
    await page.getByLabel('金額').fill('1200');

    // Category (CategorySelect)
    // Default placeholder is "カテゴリを選択"
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: '食費' }).click();

    // Description
    await page.getByLabel('用途・メモ').fill('E2E Test Lunch');

    // Date defaults to today, leave as is or pick?
    // Let's leave as is for simplicity, or we can check the date picker.

    // 6. Submit
    await page.getByRole('button', { name: '登録する' }).click();

    // 7. Verification
    // Success toast
    await expect(page.getByText('登録しました')).toBeVisible();

    // Check if it appears in the list (Dashboard usually has a list)
    // Find the row or card that contains the description
    const transactionRow = page.locator('tr').filter({ hasText: 'E2E Test Lunch' });
    
    // Verify the row is visible
    await expect(transactionRow).toBeVisible();
    
    // Check if the amount exists within that row/container
    // Using a more loose check for the amount layout, just ensuring it's in the same component
    await expect(transactionRow).toContainText('1,200');

    // 8. DB Verification
    const tx = await db.query.transaction.findFirst({
        where: eq(schema.transaction.description, 'E2E Test Lunch'),
    });
    expect(tx).toBeDefined();
    expect(tx?.amount).toBe(1200);

    // 9. Edit Transaction
    // Click the menu button in the row
    await transactionRow.getByRole('button', { name: 'メニューを開く' }).click();
    await page.getByRole('menuitem', { name: '編集' }).click();

    // Verify Dialog is open and fill new values
    const editDialog = page.getByRole('dialog', { name: '履歴の編集' });
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel('金額').fill('1500');
    await editDialog.getByLabel('用途・メモ').fill('E2E Test Lunch Updated');
    await editDialog.getByRole('button', { name: '更新する' }).click();

    // Verify Success and updated list
    await expect(page.getByText('更新しました')).toBeVisible();
    
    // Check for updated values
    // Note: The row might change if description changes, so re-query
    const updatedRow = page.locator('tr').filter({ hasText: 'E2E Test Lunch Updated' });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText('1,500');

    // 10. Delete Transaction
    await updatedRow.getByRole('button', { name: 'メニューを開く' }).click();
    await page.getByRole('menuitem', { name: '削除' }).click();
    
    // Confirm Delete
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: '削除する' }).click();

    // Verify Success and removal
    await expect(page.getByText('削除しました')).toBeVisible();
    await expect(updatedRow).not.toBeVisible();
    
    // Brief wait for DB consistency (sometimes needed in E2E vs API)
    await page.waitForTimeout(1000);

    const deletedTx = await db.query.transaction.findFirst({
        where: eq(schema.transaction.description, 'E2E Test Lunch Updated'),
    });
    expect(deletedTx).toBeUndefined();
  });

  test.afterEach(async () => {
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
