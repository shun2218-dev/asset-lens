import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { test, expect } from '@playwright/test';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

test.describe('Subscription', () => {
  const userEmail = `e2e-sub-${crypto.randomUUID()}@example.com`;
  const userPassword = 'Password123!';
  const userName = 'E2E Sub User';

  test('should allow user to create and view a subscription', async ({ page }) => {
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

    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, userEmail),
    });
    if (user) {
        await db.update(schema.user)
            .set({ emailVerified: true })
            .where(eq(schema.user.id, user.id));
    }

    // 2. Sign In
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

    // 3. Navigate to Settings -> Subscription Tab
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'サブスクリプション' }).click();

    // 4. Fill Subscription Form
    await page.getByLabel('サービス名').fill('E2E Streaming Service');
    await page.getByLabel('金額 (円)').fill('980');
    
    // Cycle defaults to Monthly, maybe verify or switch?
    // Let's stick to default for now or explicit select if needed.
    
    // Date
    await page.getByText('日付を選択').click();
    // Pick the 15th (usually safe)
    await page.getByRole('gridcell', { name: '15' }).first().click();

    
    // Category
    await page.getByRole('combobox', { name: 'カテゴリ' }).click();
    await page.getByRole('option', { name: '交際費・娯楽' }).click();

    // 5. Submit
    const submitBtn = page.getByRole('button', { name: '登録する' });
    await expect(submitBtn).toBeEnabled(); // Verify form is valid
    await submitBtn.click();

    // 6. Verification
    // Check for potential error message first (debugging)
    // await expect(page.getByText('エラーが発生しました')).not.toBeVisible();
    
    await expect(page.getByText('サブスクリプションを追加しました')).toBeVisible();

    // Verify list item appearance
    await expect(page.getByText('E2E Streaming Service')).toBeVisible();
    await expect(page.getByText('980', { exact: false })).toBeVisible();

    // 7. DB Verification
    const sub = await db.query.subscription.findFirst({
        where: eq(schema.subscription.name, 'E2E Streaming Service'),
    });
    expect(sub).toBeDefined();
    expect(sub?.amount).toBe(980);
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
