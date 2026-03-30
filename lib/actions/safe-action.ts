import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Discriminated union for action results.
 * Success case carries optional typed data; failure carries an error message.
 */
export type SafeActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

type AuthenticatedHandler<TInput, TOutput> = (
  input: TInput,
  userId: string,
) => Promise<TOutput>;

/**
 * Creates a safe, authenticated Server Action wrapper.
 *
 * Handles:
 * - Session authentication (auto-reject if not logged in)
 * - try/catch error boundary
 * - Consistent `SafeActionResult<T>` return type
 * - Structured error logging
 *
 * @example
 * ```ts
 * export const deleteItem = createSafeAction<string, void>(
 *   async (id, userId) => {
 *     await db.delete(item).where(eq(item.id, id));
 *   },
 *   { errorMessage: "Failed to delete item" }
 * );
 * ```
 */
export function createSafeAction<TInput, TOutput = void>(
  handler: AuthenticatedHandler<TInput, TOutput>,
  options: {
    /** User-facing error message when the handler throws */
    errorMessage: string;
  },
): (input: TInput) => Promise<SafeActionResult<TOutput>> {
  return async (input: TInput): Promise<SafeActionResult<TOutput>> => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Please sign in to continue" };
    }

    try {
      const data = await handler(input, session.user.id);
      return { success: true, data };
    } catch (error) {
      console.error(`[SafeAction] ${options.errorMessage}:`, error);
      const message =
        error instanceof Error ? error.message : options.errorMessage;
      return { success: false, error: message };
    }
  };
}

/**
 * Creates a safe, authenticated Server Action that takes no input.
 *
 * @example
 * ```ts
 * export const getCurrentBudgets = createSafeQuery(
 *   async (userId) => {
 *     return db.select().from(budget).where(eq(budget.userId, userId));
 *   },
 *   { errorMessage: "Failed to fetch budgets" }
 * );
 * ```
 */
export function createSafeQuery<TOutput>(
  handler: (userId: string) => Promise<TOutput>,
  options: {
    errorMessage: string;
  },
): () => Promise<SafeActionResult<TOutput>> {
  return async (): Promise<SafeActionResult<TOutput>> => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Please sign in to continue" };
    }

    try {
      const data = await handler(session.user.id);
      return { success: true, data };
    } catch (error) {
      console.error(`[SafeAction] ${options.errorMessage}:`, error);
      const message =
        error instanceof Error ? error.message : options.errorMessage;
      return { success: false, error: message };
    }
  };
}
