/**
 * Formats a point in time, given in microseconds since the Unix epoch, the way Fabric's GraphQL
 * API renders analytics timestamps: ISO 8601 in UTC with up to six fractional digits and trailing
 * zeros removed (`2026-10-05T13:00:39.156999Z`, `2026-10-05T15:03:55.116Z`,
 * `2026-10-05T00:00:00Z`).
 *
 * @param micros - Whole microseconds since 1970-01-01T00:00:00Z.
 * @returns The formatted timestamp.
 *
 * @example
 * ```typescript
 * formatAnalyticsTimestamp(1_759_669_239_156_999); // → '2025-10-05T13:00:39.156999Z'
 * ```
 */
export function formatAnalyticsTimestamp(micros: number): string {
  const seconds = Math.floor(micros / 1_000_000);
  const fraction = String(micros - seconds * 1_000_000)
    .padStart(6, '0')
    .replace(/0+$/, '');
  const wholeSeconds = new Date(seconds * 1000).toISOString().slice(0, 19);
  return `${wholeSeconds}${fraction ? `.${fraction}` : ''}Z`;
}

export default formatAnalyticsTimestamp;
