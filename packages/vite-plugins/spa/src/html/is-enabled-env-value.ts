/**
 * Resolves a Vite environment toggle that may arrive as a parsed boolean or raw string.
 *
 * @param value - Environment value supplied through plugin configuration or a custom Vite define.
 * @returns `true` only for the boolean `true` or the string `'true'`.
 */
export function isEnabledEnvValue(value: unknown): boolean {
  return value === true || value === 'true';
}
