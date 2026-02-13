/**
 * Input validation utilities for API routes
 * Provides ObjectId validation and request body/query validation helpers
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The ID string to validate
 * @returns true if valid, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Validates an ObjectId and returns an error response if invalid
 * @param id - The ID string to validate
 * @param fieldName - The name of the field (for error message)
 * @returns NextResponse with error if invalid, null if valid
 */
export function validateObjectId(
  id: string,
  fieldName: string = "ID"
): NextResponse | null {
  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: `${fieldName} is required and must be a string` },
      { status: 400 }
    );
  }

  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: `Invalid ${fieldName} format` },
      { status: 400 }
    );
  }

  return null;
}

/**
 * Validates request body using a Zod schema
 * @param request - The NextRequest object
 * @param schema - The Zod schema to validate against
 * @returns Object with validated data or error response
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<
  | { data: z.infer<T>; error: null }
  | { data: null; error: NextResponse }
> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: "Validation error",
            details: error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    return {
      data: null,
      error: NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validates query parameters using a Zod schema
 * @param request - The NextRequest object
 * @param schema - The Zod schema to validate against
 * @returns Object with validated data or error response
 */
export function validateQueryParams<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): { data: z.infer<T>; error: null } | { data: null; error: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string | string[]> = {};
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const validatedData = schema.parse(params);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: "Invalid query parameters",
            details: error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    return {
      data: null,
      error: NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validates pagination parameters with limits
 * @param page - Page number
 * @param limit - Items per page
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Validated pagination object
 */
export function validatePagination(
  page: number | string | null,
  limit: number | string | null,
  maxLimit: number = 100
): { page: number; limit: number; skip: number } {
  const pageNum = page ? Math.max(1, parseInt(String(page), 10) || 1) : 1;
  const limitNum = limit
    ? Math.min(maxLimit, Math.max(1, parseInt(String(limit), 10) || 10))
    : 10;

  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };
}
