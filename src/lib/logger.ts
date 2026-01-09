/**
 * Centralized logging utility
 * Provides consistent logging with proper levels and environment handling
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const isDevelopment = process.env.NODE_ENV === "development";

function formatMessage(level: LogLevel, ...args: unknown[]): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return `${prefix} ${args.map((arg) => {
    if (typeof arg === "object") {
      return JSON.stringify(arg, null, 2);
    }
    return String(arg);
  }).join(" ")}`;
}

export const logger = {
  /**
   * Debug logs - only in development
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(formatMessage("debug", ...args));
    }
  },

  /**
   * Info logs - always shown
   */
  info: (...args: unknown[]): void => {
    console.log(formatMessage("info", ...args));
  },

  /**
   * Warning logs - always shown
   */
  warn: (...args: unknown[]): void => {
    console.warn(formatMessage("warn", ...args));
  },

  /**
   * Error logs - always shown with full details in dev, minimal in prod
   */
  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(formatMessage("error", ...args));
    } else {
      // In production, only log error messages, not full stack traces
      const safeArgs = args.map((arg) => {
        if (arg instanceof Error) {
          return {
            name: arg.name,
            message: arg.message,
          };
        }
        return arg;
      });
      console.error(formatMessage("error", ...safeArgs));
    }
  },
};

