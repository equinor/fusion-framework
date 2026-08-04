/**
 * Decodes a base64url segment of a {@link createMockToken} JWT back to its JSON string.
 *
 * @remarks
 * Plain `atob` alone mangles non-ASCII claims: it treats its output as latin1,
 * while segments are UTF-8 encoded. This reverses that encoding and also
 * restores the standard base64 alphabet/padding `atob` expects.
 *
 * @param segment - A base64url segment, e.g. from splitting a JWT on `.`.
 * @returns The decoded UTF-8 string.
 */
export function decodeJwtSegment(segment: string): string {
  const base64 = segment
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default decodeJwtSegment;
