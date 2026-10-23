const safeKey = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const safeVersion = /^[0-9A-Za-z][0-9A-Za-z.+-]{0,63}$/;

/**
 * Omits identity containing paths, URLs, whitespace or unbounded dynamic fragments.
 * @param value - Candidate static identity.
 * @param kind - Identifier or semantic-version-like identity.
 * @returns Validated identity, or undefined when unsafe.
 */
export function safeOperationalIdentity(
  value: unknown,
  kind: 'key' | 'version' = 'key',
): string | undefined {
  return typeof value === 'string' && (kind === 'key' ? safeKey : safeVersion).test(value)
    ? value
    : undefined;
}
