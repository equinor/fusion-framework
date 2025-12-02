/**
 * Checks if a string has a protocol prefix.
 *
 * @param input - The string to check
 * @returns True if the string starts with a protocol (e.g., 'http:', 'https:', 'file:')
 *
 * @example
 * ```ts
 * hasProtocol('https://example.com')
 * // true
 *
 * hasProtocol('/users')
 * // false
 *
 * hasProtocol('file:///path/to/file')
 * // true
 * ```
 */
export const hasProtocol = (input: string): boolean => {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(input);
};
