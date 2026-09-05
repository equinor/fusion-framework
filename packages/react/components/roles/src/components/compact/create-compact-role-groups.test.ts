import { describe, expect, it } from 'vitest';
import type { ClaimableRoleDetails } from '../overview/role-details';
import { createCompactRoleGroups } from './create-compact-role-groups';

const NOW = Date.parse('2026-09-05T12:00:00Z');
const DAY = 24 * 60 * 60 * 1_000;

/**
 * Creates normalized assignments so grouping tests exercise domain policy rather than service defaults.
 * @param assignmentId - Distinct assignment identity.
 * @param overrides - Metadata varied by the eligibility scenario.
 * @returns A claimable assignment with a recent expired activation by default.
 */
const assignment = (
  assignmentId: string,
  overrides: Partial<ClaimableRoleDetails> = {},
): ClaimableRoleDetails => ({
  assignmentId,
  name: assignmentId,
  displayName: assignmentId,
  description: 'Test role',
  reasons: [],
  isActive: false,
  activeTo: new Date(NOW - DAY).toISOString(),
  ...overrides,
});

describe('createCompactRoleGroups', () => {
  it('caps newest expiry shortcuts without dropping the remaining eligible assignments', () => {
    const roles = [
      assignment('oldest', { activeTo: new Date(NOW - 4 * DAY).toISOString() }),
      assignment('newest', { activeTo: new Date(NOW - DAY).toISOString() }),
      assignment('second', { activeTo: new Date(NOW - 2 * DAY).toISOString() }),
      assignment('third', { activeTo: new Date(NOW - 3 * DAY).toISOString() }),
    ];
    const groups = createCompactRoleGroups([], roles, NOW);
    expect(groups.expired).toEqual([roles[1], roles[2], roles[3]]);
    expect(groups.available).toEqual([roles[0]]);
    expect(roles).toMatchObject([
      { assignmentId: 'oldest' },
      { assignmentId: 'newest' },
      { assignmentId: 'second' },
      { assignmentId: 'third' },
    ]);
  });

  it.each([
    ['activation expires now', { activeTo: new Date(NOW).toISOString() }, true],
    [
      'activation expired seven days ago',
      { activeTo: new Date(NOW - 7 * DAY).toISOString() },
      true,
    ],
    [
      'activation expired before the window',
      { activeTo: new Date(NOW - 7 * DAY - 1).toISOString() },
      false,
    ],
    ['activation expires in the future', { activeTo: new Date(NOW + 1).toISOString() }, false],
    ['entitlement begins now', { validFrom: new Date(NOW).toISOString() }, true],
    ['entitlement begins in the future', { validFrom: new Date(NOW + 1).toISOString() }, false],
    ['entitlement ends now', { validTo: new Date(NOW).toISOString() }, false],
    ['entitlement ends in the future', { validTo: new Date(NOW + 1).toISOString() }, true],
    ['activation remains active', { isActive: true }, false],
    ['activation has no expiry', { activeTo: null }, false],
    ['activation has malformed expiry', { activeTo: 'not-a-date' }, false],
    ['entitlement has malformed start', { validFrom: 'not-a-date' }, false],
    ['entitlement has malformed end', { validTo: '2026-02-30' }, false],
  ] satisfies ReadonlyArray<readonly [string, Partial<ClaimableRoleDetails>, boolean]>)(
    'classifies %s consistently',
    (_scenario, overrides, eligible) => {
      const role = assignment('role', overrides);
      const groups = createCompactRoleGroups([], [role], NOW);
      expect(groups.expired).toEqual(eligible ? [role] : []);
      expect(groups.available).toEqual(eligible ? [] : [role]);
    },
  );

  it('keeps claimed roles available for deactivation and avoids duplicate permanent rows', () => {
    const claimed = assignment('claimed', { isActive: true });
    const groups = createCompactRoleGroups(
      [
        { accessRoleName: 'Claimed role', assignmentType: 'Claimable' },
        {
          accessRoleName: 'Reports.Read',
          systemName: 'Reports',
          assignmentType: 'Permanent',
          activeToDate: '2027-01-01T00:00:00Z',
          scope: { isGlobal: false, values: ['A', 'B'], type: 'project' },
        },
      ],
      [claimed],
      NOW,
    );
    expect(groups.claimed).toEqual([claimed]);
    expect(groups.available).toEqual([claimed]);
    expect(groups.permanent).toHaveLength(1);
    expect(groups.permanent[0]).toMatchObject({
      displayName: 'Reports.Read',
      description: 'Access role in Reports.',
      reasons: ['Assigned as Permanent'],
      scope: { isGlobal: false, value: 'A, B', scopeTypeIdentifier: 'project' },
      validTo: '2027-01-01T00:00:00Z',
      isActive: true,
    });
  });

  it('preserves permanent assignments with absent optional metadata', () => {
    const groups = createCompactRoleGroups([{}], [], NOW);
    expect(groups.permanent[0]).toMatchObject({
      name: 'Unknown access role',
      description: 'Access role in an unknown system.',
      reasons: ['Assignment type was not provided'],
      scope: null,
    });
    expect(groups.available).toEqual([]);
    expect(groups.claimed).toEqual([]);
    expect(groups.expired).toEqual([]);
  });
});
