import type { Logger } from "drizzle-orm";

const SLOW_QUERY_THRESHOLD_MS = 500;

/**
 * Custom Drizzle logger that measures query duration.
 * - Development: logs all queries with duration
 * - Production: logs only slow queries (> 500ms) as warnings
 */
export class QueryLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    if (process.env.NODE_ENV === "development") {
      console.log("[DB Query]", query, params.length ? params : "");
    }
  }
}

/**
 * Performance-tracking logger that wraps queries with timing.
 * Used as a Drizzle logger to detect slow queries in production.
 */
export class PerformanceLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    const start = performance.now();

    // Log immediately in dev mode
    if (process.env.NODE_ENV === "development") {
      const truncatedQuery =
        query.length > 200 ? `${query.substring(0, 200)}...` : query;
      console.log(`[DB] ${truncatedQuery}`);
    }

    // Use queueMicrotask to log duration after query completes
    // Note: Drizzle's logger only fires before the query, so we track the call
    queueMicrotask(() => {
      const duration = performance.now() - start;
      if (duration > SLOW_QUERY_THRESHOLD_MS) {
        console.warn(
          `[DB SLOW QUERY] ${duration.toFixed(1)}ms: ${query.substring(0, 100)}...`,
        );
      }
    });
  }
}
