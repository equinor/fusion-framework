import { describe, expect, it } from 'vitest';
import type { RoleDetails } from '../overview/role-details';
import { formatRoleDate } from './format-role-date';
import { formatRoleDetails } from './format-role-details';

const NOW = Date.parse('2026-09-05T12:00:00Z');
const ROLE: RoleDetails = {
  displayName: 'Reports exporter',
  name: 'reports-exporter',
  description: 'Exports reports.',
  reasons: [],
  isActive: false,
};

describe('compact role metadata formatting', () => {
  it('formats scoped active assignments with their precise expiry', () => {
    const expiry = '2026-09-05T16:00:00Z';
    expect(
      formatRoleDetails(
        {
          ...ROLE,
          isActive: true,
          activeTo: expiry,
          validTo: expiry,
          scope: { isGlobal: false, value: 'Reports', scopeTypeIdentifier: 'project' },
        },
        NOW,
      ),
    ).toEqual({
      validUntil: formatRoleDate(expiry),
      scope: 'project: Reports',
      activation: `Active until ${formatRoleDate(expiry)}`,
    });
  });

  it('distinguishes global scope, absent scope, and active assignments without an expiry', () => {
    expect(formatRoleDetails(ROLE, NOW)).toEqual({
      validUntil: 'No expiration date',
      scope: 'No scopes',
      activation: 'Available to activate',
    });
    expect(
      formatRoleDetails({ ...ROLE, isActive: true, scope: { isGlobal: true, value: null } }, NOW),
    ).toMatchObject({ scope: 'Global', activation: 'Active' });
  });

  it.each([
    [{ isGlobal: false, value: 'Reports' }, 'Reports'],
    [{ isGlobal: false, value: null, scopeTypeIdentifier: 'project' }, 'project'],
    [{ isGlobal: false, value: null }, 'No scopes'],
  ])('formats partial scope metadata', (scope, expected) => {
    expect(formatRoleDetails({ ...ROLE, scope }, NOW).scope).toBe(expected);
  });

  it('classifies an inactive activation at the exact expiry boundary', () => {
    const activeTo = new Date(NOW).toISOString();
    expect(formatRoleDetails({ ...ROLE, activeTo }, NOW).activation).toBe(
      `Expired ${formatRoleDate(activeTo)}`,
    );
    expect(formatRoleDetails({ ...ROLE, activeTo }, NOW - 1).activation).toBe(
      'Available to activate',
    );
  });

  it.each([undefined, null, ''])('handles unavailable dates (%s) explicitly', (value) => {
    expect(formatRoleDate(value)).toBe('No expiration date');
  });

  it('does not present malformed metadata as unlimited validity or a usable activation date', () => {
    expect(formatRoleDate('not-a-date')).toBe('Invalid expiration date');
    expect(
      formatRoleDetails({ ...ROLE, activeTo: 'not-a-date', validTo: '2026-02-30' }, NOW),
    ).toMatchObject({
      validUntil: 'Invalid expiration date',
      activation: 'Invalid expiration date',
    });
    expect(
      formatRoleDetails({ ...ROLE, isActive: true, activeTo: 'not-a-date' }, NOW).activation,
    ).toBe('Active · Invalid expiration date');
  });
});
