/**
 * Strips ANSI escape codes (color / formatting) from a string.
 *
 * @param s - The string potentially containing ANSI sequences
 * @returns The input string with all ANSI escape sequences removed
 */
export function stripAnsi(s: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping ANSI escape sequences
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}
