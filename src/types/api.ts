// Common API response types
export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Generic error type for catch blocks
export interface ErrorWithMessage {
  message?: string;
  error?: string;
  details?: unknown;
}


