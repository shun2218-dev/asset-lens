import { test as base } from '@playwright/test';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

type AuthUser = {
  id: string;
  email: string;
  name: string;
};

// Extend basic test by providing a "authUser" fixture.
export const test = base.extend<{ authUser: AuthUser }>({
  authUser: async ({ page }, use) => {
    // 1. Setup: Create unique user credentials
    const uniqueId = crypto.randomUUID();
    const userEmail = `e2e-user-${uniqueId}@example.com`;
    const userPassword = 'Password123!';
    const userName = `E2E User ${uniqueId}`;

    // 2. Create User via API (using page.request to share context)
    await page.request.post('/api/auth/sign-up/email', {
      data: {
        email: userEmail,
        password: userPassword,
        name: userName,
      },
      headers: { 'Origin': 'http://localhost:3000' },
    });

    // 3. Verify Email (Direct DB update)
    let userId = '';
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, userEmail),
    });
    if (user) {
      userId = user.id;
      await db.update(schema.user)
        .set({ emailVerified: true })
        .where(eq(schema.user.id, user.id));
    }

    // 4. Sign In via API (using page.request shares cookies with page)
    await page.request.post('/api/auth/sign-in/email', {
      data: {
        email: userEmail,
        password: userPassword,
      },
      headers: { 'Origin': 'http://localhost:3000' },
    });

    // 5. Use the fixture value
    await use({
      id: userId,
      email: userEmail,
      name: userName,
    });

    // 6. Teardown: Delete user
    if (userId) {
      await db.delete(schema.user).where(eq(schema.user.id, userId));
    } else {
        const userToDelete = await db.query.user.findFirst({
            where: eq(schema.user.email, userEmail),
        });
        if (userToDelete) {
             await db.delete(schema.user).where(eq(schema.user.id, userToDelete.id));
        }
    }
  },
});

export { expect } from '@playwright/test';
