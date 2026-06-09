/** Initial display text used before a plain subject emits its first value. */
export const initialMessage = 'No message emitted yet';

/**
 * Formats an observable value for compact cookbook output.
 *
 * @param value - Observable value that may be missing before the first emission.
 * @returns A readable string for the current observable value.
 */
export function formatValue(value: string | number | undefined): string {
  return value === undefined ? 'undefined' : String(value);
}
