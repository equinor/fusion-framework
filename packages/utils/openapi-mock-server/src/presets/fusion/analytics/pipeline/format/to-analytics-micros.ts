/**
 * Converts an analytics timestamp to whole microseconds since the Unix epoch, so stored
 * timestamps (`2026-10-05T13:00:39.156999Z`) and query input (`2026-10-05`,
 * `2026-01-07T11:39:30.225000`) compare exactly.
 *
 * @remarks
 * Accepts an ISO 8601 date, or a date and time with up to microsecond precision and an optional
 * `Z` or `±HH:MM` offset. A value without an offset is read as UTC, as Fabric stores analytics
 * timestamps without one. Out-of-range components — month 13, February 30, hour 24, minute 60, or
 * an offset beyond ±14:00 — are rejected rather than rolled over, so an invalid GraphQL
 * `DateTime` operand is reported instead of compared against a different moment.
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

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = '', offset] =
    match;
  const [year, month, day] = [Number(yearText), Number(monthText), Number(dayText)];
  const [hour, minute, second] = [
    Number(hourText ?? 0),
    Number(minuteText ?? 0),
    Number(secondText ?? 0),
  ];
  // Each time component must be in range; overflow such as 24:00 or 10:60 is not normalized.
  if (hour > 23 || minute > 59 || second > 59) return undefined;

  const date = new Date(0);
  // setUTCFullYear keeps years before 100 as written, unlike Date.UTC.
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  // Month 13, month 0, or Feb 30 roll over to another date, so the round trip rejects them.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  const offsetMinutes = readOffsetMinutes(offset);
  // An offset outside ±14:00 is not a valid UTC offset.
  if (offsetMinutes === undefined) return undefined;
  const micros = Number(fraction.padEnd(6, '0').slice(0, 6));
  return (date.getTime() - offsetMinutes * 60_000) * 1000 + micros;
}

/**
 * Reads a UTC offset in minutes, accepting `Z`, no offset, `±HH:MM`, and `±HHMM`.
 *
 * @param offset - The offset text, or `undefined` when the value has none.
 * @returns Minutes east of UTC, or `undefined` when the offset is out of range.
 */
function readOffsetMinutes(offset: string | undefined): number | undefined {
  // `Z` and no offset are already UTC.
  if (!offset || offset.toUpperCase() === 'Z') return 0;
  const digits = offset.replace(':', '');
  const hours = Number(digits.slice(1, 3));
  const minutes = Number(digits.slice(3, 5));
  const total = hours * 60 + minutes;
  // Offsets stop at ±14:00, the range .NET DateTimeOffset (behind Fabric's GraphQL) accepts.
  if (minutes > 59 || total > 14 * 60) return undefined;
  return digits.startsWith('-') ? -total : total;
}

export default toAnalyticsMicros;
