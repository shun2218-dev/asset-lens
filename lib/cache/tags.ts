/**
 * Centralized cache tag definitions for revalidation.
 * Use these constants with `unstable_cache` tags and `revalidateTag`.
 */

/** Per-user cache tag for categories */
export const categoryTag = (userId: string) => `categories-${userId}`;

/** Per-user cache tag for stores */
export const storeTag = (userId: string) => `stores-${userId}`;

/** Per-user cache tag for budgets */
export const budgetTag = (userId: string) => `budgets-${userId}`;

/** Per-user cache tag for transactions (month-scoped) */
export const transactionTag = (userId: string, month?: string) =>
  month ? `transactions-${userId}-${month}` : `transactions-${userId}`;

/** Per-user cache tag for summaries (month-scoped) */
export const summaryTag = (userId: string, month: string) =>
  `summary-${userId}-${month}`;

/** Per-user cache tag for savings goals */
export const savingsGoalTag = (userId: string) => `savings-goals-${userId}`;
