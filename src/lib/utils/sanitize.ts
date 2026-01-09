/**
 * Input sanitization utilities
 * Provides functions to sanitize user input and prevent XSS attacks
 * Uses lightweight regex-based sanitization for server-side use
 */

/**
 * Sanitize a string input (removes HTML/script tags)
 * Use this for text fields, names, descriptions, etc.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, "") // Remove any remaining angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers (onclick, onerror, etc.)
    .trim();
}

/**
 * Sanitize HTML content (allows safe HTML tags)
 * Use this for rich text editors or content that should preserve formatting
 * Note: For production, consider using a proper HTML sanitizer if you need rich text
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  // Remove dangerous tags and attributes, keep safe formatting tags
  const dangerousTags = /<(script|iframe|object|embed|form|input|link|meta|style)[^>]*>.*?<\/\1>/gi;
  const dangerousAttributes = /\s*(on\w+|javascript:|data:|vbscript:)[^=]*="[^"]*"/gi;
  
  return input
    .replace(dangerousTags, "")
    .replace(dangerousAttributes, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * Sanitize email address
 * Validates and sanitizes email format
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") {
    return "";
  }
  // Remove any HTML/script tags first
  const sanitized = sanitizeString(email);
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return "";
  }
  return sanitized.toLowerCase().trim();
}

/**
 * Sanitize URL
 * Validates and sanitizes URL format
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== "string") {
    return "";
  }
  const sanitized = sanitizeString(url);
  try {
    const urlObj = new URL(sanitized);
    // Only allow http and https protocols
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return "";
    }
    return urlObj.toString();
  } catch {
    return "";
  }
}

/**
 * Sanitize phone number
 * Removes non-numeric characters except +, -, (, ), and spaces
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== "string") {
    return "";
  }
  // Remove HTML tags first
  const sanitized = sanitizeString(phone);
  // Keep only digits, +, -, (, ), and spaces
  return sanitized.replace(/[^\d+\-() ]/g, "").trim();
}

/**
 * Sanitize an object recursively
 * Sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options?: {
    allowHTML?: boolean;
    fields?: {
      [key: string]: "string" | "email" | "url" | "phone" | "html";
    };
  }
): T {
  const result = { ...obj };
  const { allowHTML = false, fields = {} } = options || {};

  for (const key in result) {
    if (typeof result[key] === "string") {
      const fieldType = fields[key];
      if (fieldType === "email") {
        result[key] = sanitizeEmail(result[key] as string) as T[typeof key];
      } else if (fieldType === "url") {
        result[key] = sanitizeURL(result[key] as string) as T[typeof key];
      } else if (fieldType === "phone") {
        result[key] = sanitizePhone(result[key] as string) as T[typeof key];
      } else if (fieldType === "html" || allowHTML) {
        result[key] = sanitizeHTML(result[key] as string) as T[typeof key];
      } else {
        result[key] = sanitizeString(result[key] as string) as T[typeof key];
      }
    } else if (typeof result[key] === "object" && result[key] !== null && !Array.isArray(result[key])) {
      result[key] = sanitizeObject(
        result[key] as Record<string, unknown>,
        options
      ) as T[typeof key];
    } else if (Array.isArray(result[key])) {
      result[key] = (result[key] as unknown[]).map((item) => {
        if (typeof item === "string") {
          return allowHTML ? sanitizeHTML(item) : sanitizeString(item);
        }
        if (typeof item === "object" && item !== null) {
          return sanitizeObject(item as Record<string, unknown>, options);
        }
        return item;
      }) as T[typeof key];
    }
  }

  return result;
}
