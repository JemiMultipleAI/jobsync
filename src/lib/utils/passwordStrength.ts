export type PasswordStrength = "very-weak" | "weak" | "moderate" | "strong" | "even-stronger";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return {
      strength: "very-weak",
      score: 0,
      feedback: ["Enter a password"],
    };
  }

  // Length checks
  if (password.length >= 8) {
    score += 10;
  } else {
    feedback.push("At least 8 characters");
  }

  if (password.length >= 12) {
    score += 10;
  }

  if (password.length >= 16) {
    score += 10;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 10;
  } else {
    feedback.push("Add lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score += 10;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (/[0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push("Add numbers");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push("Add special characters");
  }

  // Pattern checks (penalties)
  if (/(.)\1{2,}/.test(password)) {
    score -= 10; // Repeated characters
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    score -= 15; // Common patterns
  }

  // Bonus for complexity
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) {
    score += 10; // High character variety
  }

  // Determine strength level
  let strength: PasswordStrength;
  if (score < 20) {
    strength = "very-weak";
  } else if (score < 40) {
    strength = "weak";
  } else if (score < 60) {
    strength = "moderate";
  } else if (score < 80) {
    strength = "strong";
  } else {
    strength = "even-stronger";
  }

  // If no feedback, password is good
  if (feedback.length === 0 && score >= 60) {
    feedback.push("Great password!");
  }

  return {
    strength,
    score: Math.min(100, Math.max(0, score)),
    feedback: feedback.length > 0 ? feedback : ["Password looks good"],
  };
}

export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case "very-weak":
      return "bg-red-500";
    case "weak":
      return "bg-orange-500";
    case "moderate":
      return "bg-yellow-500";
    case "strong":
      return "bg-green-500";
    case "even-stronger":
      return "bg-emerald-600";
    default:
      return "bg-gray-300";
  }
}

export function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case "very-weak":
      return "Very Weak";
    case "weak":
      return "Weak";
    case "moderate":
      return "Moderate";
    case "strong":
      return "Strong";
    case "even-stronger":
      return "Even Stronger";
    default:
      return "Unknown";
  }
}

