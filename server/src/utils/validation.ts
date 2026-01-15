// Validation utilities

/**
 * Validate roll number format (PSG Tech format)
 * Format: 2 digits year + 1-2 letters department + 3 digits number
 * Examples: 22Z209, 21z101, 22CS001, 23IT045
 */
export function isValidRollNumber(rollNo: string): boolean {
  if (!rollNo || typeof rollNo !== "string") return false;
  // Accept both formats: 22Z209 (1 letter) and 22CS001 (2 letters)
  const pattern = /^\d{2}[A-Z]{1,2}\d{3}$/i;
  return pattern.test(rollNo.trim());
}

/**
 * Validate password (basic validation)
 * At least 6 characters, alphanumeric
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== "string") return false;
  return password.length >= 6 && password.length <= 50;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

/**
 * Validate threshold percentage (0-100)
 */
export function isValidThreshold(threshold: number): boolean {
  return typeof threshold === "number" && threshold >= 0 && threshold <= 100;
}

/**
 * Sanitize input string - remove potential XSS characters
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

/**
 * Validate and sanitize roll number
 */
export function validateAndSanitizeRollNo(rollNo: string): string | null {
  const sanitized = sanitizeInput(rollNo).toUpperCase();
  return isValidRollNumber(sanitized) ? sanitized : null;
}
