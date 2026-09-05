import { isValid, parseISO } from 'date-fns';

/** Missing metadata is not evidence that a supplied but malformed expiry is unlimited. */
export type RoleDate =
  | { readonly status: 'missing' | 'invalid' }
  | { readonly status: 'valid'; readonly timestamp: number };

/**
 * Parses Roles V2 ISO dates once for display, entitlement bounds, and expiry recovery.
 * @param value - Optional ISO service date; empty strings represent missing metadata.
 * @returns Explicit missing/invalid state or a finite timestamp for comparisons.
 */
export const parseRoleDate = (value?: string | null): RoleDate => {
  // Empty service fields carry no expiry; nonempty malformed fields must remain distinguishable.
  if (!value) {
    return { status: 'missing' };
  }
  // Preserve Date.parse's UTC date-only interpretation. Offset-bearing timestamps retain their
  // instant, and offsetless date-times retain browser-local interpretation; no display zone changes.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;
  const date = parseISO(normalized);
  return isValid(date) ? { status: 'valid', timestamp: date.getTime() } : { status: 'invalid' };
};
