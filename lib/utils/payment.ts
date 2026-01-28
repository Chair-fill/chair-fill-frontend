/**
 * Formats card number with spaces (e.g., "1234 5678 9012 3456")
 */
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  }
  return v;
}

/**
 * Formats expiry date as MM/YY
 */
export function formatExpiryDate(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
}

/**
 * Validates card number format
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{13,19}$/.test(cleaned);
}

/**
 * Validates expiry date format (MM/YY)
 */
export function validateExpiryDate(expiryDate: string): boolean {
  if (expiryDate.length !== 5) return false;
  const [month, year] = expiryDate.split('/');
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  return monthNum >= 1 && monthNum <= 12 && yearNum >= 0 && yearNum <= 99;
}

/**
 * Validates CVV (3-4 digits)
 */
export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}
