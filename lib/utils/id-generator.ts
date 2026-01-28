/**
 * Generates a unique ID for contacts
 */
export function generateContactId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
