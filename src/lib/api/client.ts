/**
 * API Client Utility
 * Centralized fetch wrapper for API calls
 */

export interface ApiError {
  error?: string;
  message?: string;
  details?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails: unknown = undefined;
        try {
          const error: ApiError = await response.json();
          errorMessage = error.error || error.message || errorMessage;
          if (error.details) {
            errorDetails = error.details;
            console.error("API Error Details:", error.details);
          }
        } catch (parseError) {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            if (text) {
              errorMessage = text;
            }
          } catch {
            // Ignore
          }
        }
        const apiError = new Error(errorMessage) as Error & { details?: unknown };
        if (errorDetails) {
          apiError.details = errorDetails;
        }
        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Log the error for debugging
        if (process.env.NODE_ENV === "development") {
          console.error(`API Request Error [${endpoint}]:`, error.message);
        }
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    // If data is FormData, don't stringify it and don't set Content-Type
    if (data instanceof FormData) {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }

    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // File upload
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient();

