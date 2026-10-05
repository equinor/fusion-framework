/**
 * Converts an analytics timestamp to whole microseconds since the Unix epoch, so stored
 * timestamps (`2026-10-05T13:00:39.156999Z`) and query input (`2026-10-05`,
 * `2026-01-07T11:39:30.225000`) compare exactly.
 *
 * @remarks
 * Accepts an ISO 8601 date, or a date and time with up to microsecond precision and an optional
 * `Z` or `±HH:MM` offset. A value without an offset is read as UTC, as Fabric stores analytics
 * timestamps without one.
 *
 * @param value - The timestamp text.
 * @returns Microseconds since the epoch, or `undefined` when the text is not a timestamp.
 *
 * @example
 * ```typescript
 * toAnalyticsMicros('2026-10-05'); // → 1_791_158_400_000_000
 * ```
 */
export function toAnalyticsMicros(value: string): number | undefined {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?(Z|[+-]\d{2}:?\d{2})?$/i.exec(
      value.trim(),
    );
  // Text that is not an ISO 8601 date or date-time has no point in time.
  if (!match) return undefined;

  const [, year, month, day, hour = '0', minute = '0', second = '0', fraction = '', offset] = match;
  const millis = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
  // Date.UTC rolls invalid dates over (Feb 30 → Mar 2); the round trip rejects them.
  if (new Date(millis).getUTCDate() !== +day) return undefined;

  let offsetMinutes = 0;
  // A trailing offset shifts the local time to UTC; `Z` and no offset are already UTC.
  if (offset && offset.toUpperCase() !== 'Z') {
    const digits = offset.replace(':', '');
    const sign = digits.startsWith('-') ? -1 : 1;
    offsetMinutes = sign * (Number(digits.slice(1, 3)) * 60 + Number(digits.slice(3, 5)));
  }
  const micros = Number(fraction.padEnd(6, '0').slice(0, 6));
  return (millis - offsetMinutes * 60_000) * 1000 + micros;
}

export default toAnalyticsMicros;
