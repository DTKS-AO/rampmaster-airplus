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
  
  // Handle different formats
  let cleaned = digits;
  if (digits.startsWith('00244')) {
    cleaned = digits.slice(5);
  } else if (digits.startsWith('244')) {
    cleaned = digits.slice(3);
  }
  
  // Should be 9 digits starting with 9
  if (cleaned.length !== 9 || !cleaned.startsWith('9')) {
    return phone; // Return original if invalid
  }

  // Format as +244 9XX XXX XXX
  return `+244 ${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
}

/**
 * Normalize Angolan BI number
 * Ensures format: 000000000LA000
 */
export function normalizeBI(bi: string): string {
  // Convert to uppercase and remove spaces/special chars
  const cleaned = bi.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Try to fix common issues
  if (/^\d{9}\d{3}$/.test(cleaned)) {
    // Missing letters - insert LA
    return `${cleaned.slice(0, 9)}LA${cleaned.slice(9)}`;
  }
  
  // Already in correct format
  if (/^\d{9}[A-Z]{2}\d{3}$/.test(cleaned)) {
    return cleaned;
  }
  
  return bi.toUpperCase().replace(/\s/g, '');
}

/**
 * Normalize mechanic number
 * Ensures format: APMxxx
 */
export function normalizeMechanicNumber(num: string): string {
  const cleaned = num.toUpperCase().replace(/\s/g, '');
  
  // Add APM prefix if missing
  if (!cleaned.startsWith('APM')) {
    return `APM${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Format user role for display
 */
export function formatUserRole(role: string): string {
  const roleMap: Record<string, string> = {
    super_admin: 'Super Admin',
    gestor: 'Gestor',
    supervisor: 'Supervisor',
    tecnico: 'Técnico',
    auxiliar: 'Auxiliar',
    cliente: 'Cliente'
  };

  return roleMap[role] || role;
}

/**
 * Format date for display in PT-BR
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(typeof date === 'string' ? new Date(date) : date);
}

/**
 * Format currency in AOA
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(value);
}