/**
 * Get user initials from name
 * @param name - User's full name
 * @param fallback - Fallback character if name is empty (default: "U")
 * @returns Initials string (e.g., "John Doe" -> "JD")
 */
export function getInitials(name?: string, fallback: string = "U"): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
