import { describe, expect, it } from 'vitest';
import { createClaimableRoles } from './create-claimable-roles';

describe('createClaimableRoles', () => {
  it('preserves identity, scope, validity, and entitlement reasons', () => {
    const assignment = {
      id: 'reports',
      claimableRole: {
        name: 'reports-exporter',
        displayName: 'Reports exporter',
        description: 'Exports reports.',
      },
      reasons: ['Assigned through the Reports team'],
      isActive: true,
      activeTo: '2026-09-05T16:00:00Z',
      validFrom: '2026-01-01T00:00:00Z',
      validTo: '2026-12-31T00:00:00Z',
      scope: { isGlobal: false, value: 'Reports', scopeTypeIdentifier: 'project' },
    };
    expect(createClaimableRoles([assignment])).toEqual([
      {
        assignmentId: 'reports',
        ...assignment.claimableRole,
        reasons: assignment.reasons,
        isActive: true,
        activeTo: assignment.activeTo,
        validFrom: assignment.validFrom,
        validTo: assignment.validTo,
        scope: assignment.scope,
      },
    ]);
  });

  it('omits unaddressable assignments while keeping explicit defaults for missing metadata', () => {
    const roles = createClaimableRoles([
      {},
      { id: null },
      { id: 'minimal' },
      { id: 'named', claimableRole: { name: 'Reports.Read' } },
    ]);
    expect(roles).toHaveLength(2);
    expect(roles[0]).toMatchObject({
      assignmentId: 'minimal',
      displayName: 'Unknown role',
      name: 'Unknown role',
      description: 'No description is available.',
      reasons: [],
      isActive: false,
    });
    expect(roles[1]).toMatchObject({ name: 'Reports.Read', displayName: 'Reports.Read' });
  });

  it('returns an empty collection for accounts without claimable roles', () => {
    expect(createClaimableRoles([])).toEqual([]);
  });
});
