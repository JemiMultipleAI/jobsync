/**
 * Database transaction utilities
 * Provides helpers for MongoDB transactions
 */

import mongoose from "mongoose";
import connectDB from "./connect";

/**
 * Executes a function within a MongoDB transaction
 * @param callback - The function to execute within the transaction
 * @returns The result of the callback function
 * @throws Error if transaction fails
 */
export async function withTransaction<T>(
  callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Executes multiple database operations within a transaction
 * Useful for operations that need to be atomic (all succeed or all fail)
 * @param operations - Array of async functions to execute
 * @returns Array of results from each operation
 */
export async function executeTransaction<T>(
  operations: Array<(session: mongoose.ClientSession) => Promise<T>>
): Promise<T[]> {
  return withTransaction(async (session) => {
    const results: T[] = [];
    for (const operation of operations) {
      const result = await operation(session);
      results.push(result);
    }
    return results;
  });
}
