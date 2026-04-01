import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { log, requestContext } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

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
    errorMessage: string;
    rateLimit?: "write" | "read" | "ai";
  },
): (input: TInput) => Promise<SafeActionResult<TOutput>> {
  return async (input: TInput): Promise<SafeActionResult<TOutput>> => {
    const reqHeaders = await headers();
    const correlationId =
      reqHeaders?.get?.("x-correlation-id") ?? crypto.randomUUID();

    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session) {
      return { success: false, error: "Please sign in to continue" };
    }

    const { allowed } = await checkRateLimit(
      session.user.id,
      options.rateLimit ?? "write",
    );
    if (!allowed) {
      log.warn("Rate limit exceeded", { userId: session.user.id });
      return {
        success: false,
        error: "Too many requests. Please try again later.",
      };
    }

    return requestContext.run(
      { correlationId, userId: session.user.id },
      async () => {
        const start = Date.now();
        try {
          const data = await handler(input, session.user.id);
          log.info("Action completed", {
            action: options.errorMessage,
            duration: Date.now() - start,
          });
          return { success: true, data };
        } catch (error) {
          log.error(options.errorMessage, {
            action: options.errorMessage,
            duration: Date.now() - start,
            error: error instanceof Error ? error.message : String(error),
          });
          const message =
            error instanceof Error ? error.message : options.errorMessage;
          return { success: false, error: message };
        }
      },
    );
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
    rateLimit?: "write" | "read" | "ai";
  },
): () => Promise<SafeActionResult<TOutput>> {
  return async (): Promise<SafeActionResult<TOutput>> => {
    const reqHeaders = await headers();
    const correlationId =
      reqHeaders?.get?.("x-correlation-id") ?? crypto.randomUUID();

    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session) {
      return { success: false, error: "Please sign in to continue" };
    }

    const { allowed } = await checkRateLimit(
      session.user.id,
      options.rateLimit ?? "read",
    );
    if (!allowed) {
      log.warn("Rate limit exceeded", { userId: session.user.id });
      return {
        success: false,
        error: "Too many requests. Please try again later.",
      };
    }

    return requestContext.run(
      { correlationId, userId: session.user.id },
      async () => {
        const start = Date.now();
        try {
          const data = await handler(session.user.id);
          log.info("Query completed", {
            action: options.errorMessage,
            duration: Date.now() - start,
          });
          return { success: true, data };
        } catch (error) {
          log.error(options.errorMessage, {
            action: options.errorMessage,
            duration: Date.now() - start,
            error: error instanceof Error ? error.message : String(error),
          });
          const message =
            error instanceof Error ? error.message : options.errorMessage;
          return { success: false, error: message };
        }
      },
    );
  };
}
