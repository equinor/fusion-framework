/**
 * Truncates a string to a maximum length, appending an ellipsis when cut.
 *
 * @param str - The string to truncate.
 * @param max - Maximum length of the returned string, including the ellipsis.
 * @returns The original string, or a shortened version ending in `…`.
 */
export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}
