/**
 * Format utils for common data types
 */

/**
 * Normalize an Angolan phone number to standard format
 * Converts various input formats to +244 9XX XXX XXX
 */
export function normalizeAngolanPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 244, remove it
  const cleaned = digits.startsWith('244') ? digits.slice(3) : digits;
  
  // Should be 9 digits starting with 9
  if (cleaned.length !== 9 || !cleaned.startsWith('9')) {
    return phone; // Return original if invalid
  }

  // Format as +244 9XX XXX XXX
  return `+244 ${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
}

/**
 * Normalize Angolan BI number
 * Converts to uppercase and removes spaces
 */
export function normalizeBI(bi: string): string {
  return bi.toUpperCase().replace(/\s/g, '');
}

/**
 * Normalize mechanic number
 * Converts to uppercase and removes spaces
 */
export function normalizeMechanicNumber(num: string): string {
  return num.toUpperCase().replace(/\s/g, '');
}