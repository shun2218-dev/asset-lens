import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITEST;

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  ...(isDev && !isTest
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss" },
        },
      }
    : {}),
});

type RequestContext = {
  correlationId: string;
  userId?: string;
};

type ContextStore<T> = {
  run<R>(store: T, callback: () => R): R;
  getStore(): T | undefined;
};

function createContextStore<T>(): ContextStore<T> {
  try {
    const { AsyncLocalStorage } = require("async_hooks");
    return new AsyncLocalStorage() as ContextStore<T>;
  } catch {
    let current: T | undefined;
    return {
      run<R>(store: T, callback: () => R): R {
        const prev = current;
        current = store;
        try {
          return callback();
        } finally {
          current = prev;
        }
      },
      getStore() {
        return current;
      },
    };
  }
}

export const requestContext: ContextStore<RequestContext> =
  createContextStore<RequestContext>();

function getContext(): Partial<RequestContext> {
  return requestContext.getStore() ?? {};
}

/** Create a child logger with current request context. */
function withContext() {
  const ctx = getContext();
  return logger.child({
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
    ...(ctx.userId ? { userId: ctx.userId } : {}),
  });
}

export const log = {
  info(msg: string, data?: Record<string, unknown>) {
    withContext().info(data ?? {}, msg);
  },
  warn(msg: string, data?: Record<string, unknown>) {
    withContext().warn(data ?? {}, msg);
  },
  error(msg: string, data?: Record<string, unknown>) {
    withContext().error(data ?? {}, msg);
  },
  debug(msg: string, data?: Record<string, unknown>) {
    withContext().debug(data ?? {}, msg);
  },
};
