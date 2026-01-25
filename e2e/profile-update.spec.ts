import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { test, expect } from '@playwright/test';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

test.describe('Profile Update', () => {
  const userEmail = `e2e-profile-${crypto.randomUUID()}@example.com`;
  const userPassword = 'Password123!';
  const userName = 'E2E Profile User';

  test('should allow user to update their profile name', async ({ page }) => {
    // 1. Auth Setup (Create User & Login via API)
    await page.request.post('/api/auth/sign-up/email', {
      data: {
        email: userEmail,
        password: userPassword,
        name: userName,
      },
      headers: { 'Origin': 'http://localhost:3000' },
    });

    const user = await db.query.user.findFirst({
        where: eq(schema.user.email, userEmail),
    });
    if (user) {
        await db.update(schema.user)
            .set({ emailVerified: true })
            .where(eq(schema.user.id, user.id));
    }

    await page.request.post('/api/auth/sign-in/email', {
        data: {
            email: userEmail,
            password: userPassword,
        },
        headers: { 'Origin': 'http://localhost:3000' },
    });
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navigate to Settings
    await page.getByRole('link', { name: '設定' }).click();
    await expect(page).toHaveURL(/\/settings/);

    // 3. Update Name
    const newName = 'Updated E2E User';
    await page.getByLabel('名前').fill(newName);
    await page.getByRole('button', { name: '更新する' }).click();
    
    // 4. Verify Toast and UI
    await expect(page.getByText('プロフィールを更新しました')).toBeVisible();
    await expect(page.getByLabel('名前')).toHaveValue(newName);

    // 5. DB Verification
    const userInDb = await db.query.user.findFirst({
        where: eq(schema.user.email, userEmail),
    });
    expect(userInDb?.name).toBe(newName);
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
