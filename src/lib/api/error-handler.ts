import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

/**
 * Centralized error handling for API routes
 * Provides consistent error responses while preventing information leakage
 */
export function handleApiError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  // Mongoose validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((err) => ({
      path: err.path,
      message: err.message,
    }));

    return NextResponse.json(
      {
        error: "Validation error",
        details,
      },
      { status: 400 }
    );
  }

  // Mongoose duplicate key error (unique constraint violation)
  interface MongooseErrorWithCode extends mongoose.Error {
    code?: number;
    keyPattern?: Record<string, unknown>;
  }
  if (error instanceof mongoose.Error && (error as MongooseErrorWithCode).code === 11000) {
    const mongooseError = error as MongooseErrorWithCode;
    const field = Object.keys(mongooseError.keyPattern || {})[0] || "field";
    return NextResponse.json(
      {
        error: "Duplicate entry",
        message: `${field} already exists`,
      },
      { status: 409 }
    );
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      {
        error: "Invalid ID format",
        message: `Invalid ${error.path}: ${error.value}`,
      },
      { status: 400 }
    );
  }

  // Log the full error for debugging (server-side only)
  if (process.env.NODE_ENV === "development") {
    console.error("[API Error]", error);
  } else {
    // In production, log minimal information
    console.error("[API Error]", {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : "Unknown",
    });
  }

  // Return safe error message to client
  return NextResponse.json(
    {
      error: "Internal server error",
      message: process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.message
          : "An unknown error occurred"
        : "An error occurred while processing your request",
    },
    { status: 500 }
  );
}

