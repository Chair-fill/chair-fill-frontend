/**
 * Format a name for display: first character of each word capitalized.
 * e.g. "john doe" -> "John Doe", "MARY JANE" -> "Mary Jane"
 */
export function formatDisplayName(name: string | null | undefined): string {
  if (name == null || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
