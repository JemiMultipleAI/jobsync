/**
 * Request logging middleware
 * Logs API requests with timing, status, and error information
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

interface RequestLogData {
  method: string;
  path: string;
  status?: number;
  duration?: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  error?: string;
}

/**
 * Logs an API request
 * @param request - The NextRequest object
 * @param response - The NextResponse object (optional)
 * @param startTime - Request start time in milliseconds
 * @param userId - Optional user ID
 * @param error - Optional error message
 */
export function logRequest(
  request: NextRequest,
  response?: NextResponse,
  startTime?: number,
  userId?: string,
  error?: string
): void {
  const logData: RequestLogData = {
    method: request.method,
    path: request.nextUrl.pathname,
    userId,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  };

  if (response) {
    logData.status = response.status;
  }

  if (startTime) {
    logData.duration = Date.now() - startTime;
  }

  if (error) {
    logData.error = error;
  }

  // Log based on status code
  if (logData.status) {
    if (logData.status >= 500) {
      logger.error("[API Request]", logData);
    } else if (logData.status >= 400) {
      logger.warn("[API Request]", logData);
    } else {
      logger.info("[API Request]", logData);
    }
  } else {
    logger.info("[API Request]", logData);
  }
}

/**
 * Creates a request logging wrapper for API route handlers
 * @param handler - The API route handler function
 * @returns Wrapped handler with logging
 */
export function withRequestLogging<T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as NextRequest;
    const startTime = Date.now();
    let response: NextResponse;
    let error: string | undefined;

    try {
      response = await handler(...args);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      response = NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    // Extract user ID from response or request if available
    const userId = (request as { user?: { userId?: string } }).user?.userId;

    logRequest(request, response, startTime, userId, error);

    return response;
  }) as T;
}
