import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { test, expect } from './fixtures';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

test.describe('Transaction', () => {

  test('should allow user to create a new transaction', async ({ page, authUser }) => {
    // 1. Auth Setup handled by fixture

    // 2. Navigate to Dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // 3. Fill Transaction Form
    // Amount
    await page.getByLabel('金額').fill('1200');

    // Category (CategorySelect)
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: '食費' }).click();

    // Description
    await page.getByLabel('用途・メモ').fill('E2E Test Lunch');

    // 4. Submit
    await page.getByRole('button', { name: '登録する' }).click();

    // 5. Verification
    // Success toast
    await expect(page.getByText('登録しました')).toBeVisible();

    // Check row
    const transactionRow = page.locator('tr').filter({ hasText: 'E2E Test Lunch' });
    
    // Verify visibility and amount
    await expect(transactionRow).toBeVisible();
    await expect(transactionRow).toContainText('1,200');

    // 6. DB Verification
    const tx = await db.query.transaction.findFirst({
        where: eq(schema.transaction.description, 'E2E Test Lunch'),
    });
    expect(tx).toBeDefined();
    expect(tx?.amount).toBe(1200);

    // 7. Edit Transaction
    await transactionRow.getByRole('button', { name: 'メニューを開く' }).click();
    await page.getByRole('menuitem', { name: '編集' }).click();

    // Verify Dialog
    const editDialog = page.getByRole('dialog', { name: '履歴の編集' });
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel('金額').fill('1500');
    await editDialog.getByLabel('用途・メモ').fill('E2E Test Lunch Updated');
    await editDialog.getByRole('button', { name: '更新する' }).click();

    // Verify Success
    await expect(page.getByText('更新しました')).toBeVisible();
    
    // Check updated values
    const updatedRow = page.locator('tr').filter({ hasText: 'E2E Test Lunch Updated' });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText('1,500');

    // 8. Delete Transaction
    await updatedRow.getByRole('button', { name: 'メニューを開く' }).click();
    await page.getByRole('menuitem', { name: '削除' }).click();
    
    // Confirm Delete
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: '削除する' }).click();

    // Verify Success
    await expect(page.getByText('削除しました')).toBeVisible();
    await expect(updatedRow).not.toBeVisible();
    
    // Brief wait for DB consistency
    await page.waitForTimeout(1000);

    const deletedTx = await db.query.transaction.findFirst({
        where: eq(schema.transaction.description, 'E2E Test Lunch Updated'),
    });
    expect(deletedTx).toBeUndefined();
  });
});
