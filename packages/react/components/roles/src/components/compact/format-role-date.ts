import { parseRoleDate } from '../../dates/parse-role-date';

/**
 * Formats assignment expiry metadata consistently in rows and the information dialog.
 * @param value - Optional service date.
 * @returns Browser-local date and time, or distinct missing/invalid expiry feedback.
 */
export const formatRoleDate = (value?: string | null): string => {
  const date = parseRoleDate(value);
  // Invalid metadata must not promise unlimited entitlement.
  if (date.status !== 'valid') {
    return date.status === 'missing' ? 'No expiration date' : 'Invalid expiration date';
  }
  // DateTime defaults to enGB/date-fns patterns; retain the user's browser locale and time zone.
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    date.timestamp,
  );
};
