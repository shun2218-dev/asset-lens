import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { test, expect } from './fixtures';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

test.describe('Subscription', () => {

  test('should allow user to create and view a subscription', async ({ page, authUser }) => {
    // 1. Auth Setup handled by fixture

    // 2. Navigate to Settings -> Subscription Tab
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'サブスクリプション' }).click();

    // 3. Fill Subscription Form
    await page.getByLabel('サービス名').fill('E2E Streaming Service');
    await page.getByLabel('金額 (円)').fill('980');
    
    // Cycle defaults to Monthly
    
    // Date
    await page.getByText('日付を選択').click();
    // Pick the 15th
    await page.getByRole('gridcell', { name: '15' }).first().click();

    // Category
    await page.getByRole('combobox', { name: 'カテゴリ' }).click();
    await page.getByRole('option', { name: '交際費・娯楽' }).click();

    // 4. Submit
    const submitBtn = page.getByRole('button', { name: '登録する' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 5. Verification
    await expect(page.getByText('サブスクリプションを追加しました')).toBeVisible();

    // Verify list item appearance
    await expect(page.getByText('E2E Streaming Service')).toBeVisible();
    await expect(page.getByText('980', { exact: false })).toBeVisible();

    // 6. DB Verification
    const sub = await db.query.subscription.findFirst({
        where: eq(schema.subscription.name, 'E2E Streaming Service'),
    });
    expect(sub).toBeDefined();
    expect(sub?.amount).toBe(980);
  });
});
